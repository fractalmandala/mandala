"""
Pytest suite for the SKAA core. Runs with no MCP dependency — everything
here exercises skaa.db / skaa.tools / skaa.samskara directly, which is
also how you'd unit test a fork of this package.

Run with:
    cd server && python -m pytest tests/ -v
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from skaa.db import SmritiStore  # noqa: E402
from skaa.samskara import (  # noqa: E402
    duplicate_candidates,
    find_conflicts,
    mine_proposals,
)
from skaa.tools import (  # noqa: E402
    SkaaContext,
    skaa_execute,
    skaa_memory_query,
    skaa_memory_write,
    skaa_samskara_apply,
    skaa_samskara_proposals,
    skaa_session_close,
    skaa_status,
)


@pytest.fixture()
def store(tmp_path):
    s = SmritiStore(tmp_path / "smriti.db")
    yield s
    s.close()


@pytest.fixture()
def ctx(tmp_path):
    c = SkaaContext(db_path=tmp_path / "smriti.db", session_id="test-session")
    yield c
    c.close()


# ---------------------------------------------------------------------------
# db.py
# ---------------------------------------------------------------------------

def test_schema_creates_tables(store):
    assert store.count() == 0


def test_write_and_query_roundtrip(store):
    result = store.write(
        session_id="s1",
        content="Wrote the install script for the package.",
        pramana="pratyaksa",
        karta="agent",
        karma="skaa-package/install-script",
        dhatu_cluster="kr",
        tags="scripts",
    )
    assert result["entry_id"]
    found = store.get_by_id(result["entry_id"])
    assert found is not None
    assert found["content"].startswith("Wrote the install script")

    results = store.query("install script", top_k=5)
    assert len(results) == 1
    assert results[0]["entry_id"] == result["entry_id"]


def test_write_rejects_bad_pramana(store):
    with pytest.raises(ValueError):
        store.write(
            session_id="s1", content="x", pramana="not-a-real-pramana",
            karta="agent", karma="k",
        )


def test_write_requires_karta_and_karma(store):
    with pytest.raises(ValueError):
        store.write(session_id="s1", content="x", pramana="pratyaksa", karta="", karma="k")
    with pytest.raises(ValueError):
        store.write(session_id="s1", content="x", pramana="pratyaksa", karta="agent", karma="")


def test_query_dhatu_filter(store):
    store.write(session_id="s1", content="A design decision", pramana="anumana",
                karta="agent", karma="k1", dhatu_cluster="cit")
    store.write(session_id="s1", content="A build task", pramana="pratyaksa",
                karta="agent", karma="k2", dhatu_cluster="kr")
    only_cit = store.query("", dhatu_cluster="cit", top_k=10)
    assert len(only_cit) == 1
    assert only_cit[0]["dhatu_cluster"] == "cit"


def test_query_pramana_min_filters_by_weight(store):
    store.write(session_id="s1", content="directly observed fact", pramana="pratyaksa",
                karta="agent", karma="k1")
    store.write(session_id="s1", content="a guess based on evidence", pramana="anumana",
                karta="agent", karma="k2")
    store.write(session_id="s1", content="hearsay from someone else", pramana="sabda",
                karta="agent", karma="k3")
    strong_only = store.query("", pramana_min="anumana", top_k=10)
    prams = {r["pramana"] for r in strong_only}
    assert prams == {"pratyaksa", "anumana"}


def test_query_ranks_by_token_overlap_then_recency(store):
    store.write(session_id="s1", content="unrelated entry about weather", pramana="pratyaksa",
                karta="agent", karma="k1")
    store.write(session_id="s1", content="the measurement harness probes memory recall",
                pramana="pratyaksa", karta="agent", karma="k2")
    results = store.query("measurement harness probes", top_k=1)
    assert "measurement harness" in results[0]["content"]


# ---------------------------------------------------------------------------
# samskara.py
# ---------------------------------------------------------------------------

def test_mine_proposals_recurring_domain(store):
    for i in range(4):
        store.write(
            session_id="s1", content=f"Did task {i} in the recurring domain.",
            pramana="pratyaksa", karta="agent", karma="recurring-domain/task",
        )
    proposals = mine_proposals(store, "s1")
    domains = [p["domain"] for p in proposals]
    assert any(d.startswith("recurring-domain:recurring-domain") for d in domains)
    # proposals must be staged as pending, never auto-applied
    staged = store.list_proposals("pending")
    assert len(staged) == len(proposals)
    assert all(p["status"] == "pending" for p in staged)


def test_mine_proposals_explicit_preference(store):
    store.write(
        session_id="s1",
        content="Standing preference learned: never use hardcoded style lines in prompts.",
        pramana="pratyaksa", karta="agent", karma="prompts/style",
    )
    proposals = mine_proposals(store, "s1")
    assert any(p["domain"].startswith("explicit-preference:") for p in proposals)


def test_mine_proposals_recurring_gotcha(store):
    store.write(session_id="s1", content="Technical note: formatting silently drops.",
                pramana="pratyaksa", karta="agent", karma="k1")
    store.write(session_id="s1", content="Another bug: the same silently drop issue reappeared.",
                pramana="pratyaksa", karta="agent", karma="k2")
    proposals = mine_proposals(store, "s1")
    assert any(p["domain"] == "recurring-gotcha" for p in proposals)


def test_find_conflicts_detects_negation_pair(store):
    store.write(session_id="s1", content="Rule: no bullets in these slides.",
                pramana="pratyaksa", karta="agent", karma="slides/rules")
    store.write(session_id="s1", content="Later: use bullets for this section instead.",
                pramana="pratyaksa", karta="agent", karma="slides/rules")
    conflicts = find_conflicts(store)
    assert len(conflicts) == 1
    assert conflicts[0]["karma_prefix"] == "slides"


def test_duplicate_candidates_flags_high_overlap(store):
    text = "This entry describes building the measurement harness with probes and metrics scripts for smriti."
    store.write(session_id="s1", content=text, pramana="pratyaksa", karta="agent", karma="dup/one")
    store.write(session_id="s1", content=text + " Slight variation added here.",
                pramana="pratyaksa", karta="agent", karma="dup/one")
    dupes = duplicate_candidates(store, threshold=0.5)
    assert len(dupes) == 1


# ---------------------------------------------------------------------------
# tools.py (skaa_* function surface, same shapes the MCP wrappers return)
# ---------------------------------------------------------------------------

def test_skaa_status_shape(ctx):
    s = skaa_status(ctx)
    assert s["ok"] is True
    assert s["session_id"] == "test-session"
    assert s["tool_count"] == 4
    assert set(s["tools"]) == {"dris", "kri", "gam", "vad"}


def test_skaa_memory_write_and_query(ctx):
    w = skaa_memory_write(
        ctx, content="Installed the package into a fresh project.",
        pramana="pratyaksa", karta="agent", karma="install/fresh-project",
        dhatu_cluster="kr",
    )
    assert w["ok"] is True
    q = skaa_memory_query(ctx, "installed package", top_k=5)
    assert q["count"] == 1


def test_skaa_memory_write_rejects_bad_pramana_gracefully(ctx):
    w = skaa_memory_write(ctx, content="x", pramana="nonsense", karta="agent", karma="k")
    assert w["ok"] is False
    assert "pramana" in w["error"]


def test_session_close_then_proposals_then_apply(ctx):
    for i in range(3):
        skaa_memory_write(
            ctx, content=f"Recurring task {i}", pramana="pratyaksa",
            karta="agent", karma="recur/task",
        )
    closed = skaa_session_close(ctx)
    assert closed["proposals_staged"] >= 1

    proposals = skaa_samskara_proposals(ctx)["proposals"]
    assert len(proposals) >= 1
    pid = proposals[0]["proposal_id"]

    applied = skaa_samskara_apply(ctx, pid)
    assert len(applied["applied"]) == 1

    # re-applying the same id is a no-op, not a duplicate rule (idempotency)
    applied_again = skaa_samskara_apply(ctx, pid)
    assert applied_again["applied"] == []
    assert pid in applied_again["already_resolved"]

    still_pending = skaa_samskara_proposals(ctx)["proposals"]
    assert all(p["proposal_id"] != pid for p in still_pending)


def test_skaa_execute_classifies_dhatu(ctx):
    result = skaa_execute(ctx, "please review and check the last deliverable")
    assert result["ok"] is True
    assert result["dhatu"] == "dris"
    # the dispatch decision itself should be auditable in smriti
    q = skaa_memory_query(ctx, "classified instruction", top_k=5)
    assert q["count"] >= 1


def test_skaa_execute_defaults_to_vad_when_no_keywords_match(ctx):
    result = skaa_execute(ctx, "xyz abc qux")
    assert result["dhatu"] == "vad"
