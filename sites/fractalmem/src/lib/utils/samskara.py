"""
Samskara mining — turning repeated patterns in smrti into proposed durable rules.

This is the piece that was designed (in the July 15 FractalEngine plan) but,
per the July 29 audit, never actually built: skaa_samskara_proposals had
zero entries after five weeks of real use because nothing was generating
them. The heuristics below are deliberately simple and legible rather than
another LLM call — you can read exactly why a proposal fired.

Per SYS-03, mine_proposals() only STAGES proposals (status="pending"). It
never calls apply_proposals(). Promotion always requires an explicit
skaa_samskara_apply call naming proposal_ids.
"""

from __future__ import annotations

import re
from collections import Counter, defaultdict

from .db import SmritiStore

MIN_REPEAT_COUNT = 3  # how many times a pattern must recur before proposing a rule

PREFERENCE_MARKERS = re.compile(
    r"\b(standing preference|per \w+'s (?:request|instruction|feedback)|"
    r"always|never|from now on|going forward)\b",
    re.IGNORECASE,
)

GOTCHA_MARKERS = re.compile(
    r"\b(gotcha|silently drop|bug|technical note|note:|learned)\b",
    re.IGNORECASE,
)

NEGATION_PAIRS = [
    ("no bullets", "use bullets"),
    ("no em-dash", "use em-dash"),
    ("without design", "with design"),
    ("no design", "designed"),
]


def _karma_prefix(karma: str) -> str:
    return karma.split("/")[0] if karma else "(unscoped)"


def mine_proposals(store: SmritiStore, session_id: str) -> list[dict]:
    """Scan ALL smriti (not just this session) and stage proposals.

    Three heuristics, each producing a distinct domain of proposal:
      - "recurring-domain": the same karma-prefix shows up >= MIN_REPEAT_COUNT
        times — worth asking whether it deserves a standing convention.
      - "explicit-preference": entries whose content itself flags a stated
        preference or standing rule (e.g. "standing preference learned: ...").
      - "recurring-gotcha": entries flagging a bug/technical note that has
        shown up more than once — worth promoting into a coding standard.
    """
    entries = store.all_entries()
    proposals: list[dict] = []

    # 1. recurring-domain
    by_prefix: dict[str, list[dict]] = defaultdict(list)
    for e in entries:
        by_prefix[_karma_prefix(e["karma"])].append(e)
    for prefix, group in by_prefix.items():
        if len(group) >= MIN_REPEAT_COUNT:
            rule = (
                f"'{prefix}' has recurred {len(group)} times in smriti — "
                f"consider a standing convention or checklist for this domain "
                f"instead of re-deriving the approach each time."
            )
            result = store.stage_proposal(
                session_id=session_id,
                rule=rule,
                domain=f"recurring-domain:{prefix}",
                notes="Heuristic: karma-prefix repeat count >= MIN_REPEAT_COUNT.",
                source_entry_ids=[e["entry_id"] for e in group],
            )
            proposals.append({**result, "rule": rule, "domain": f"recurring-domain:{prefix}"})

    # 2. explicit-preference
    pref_hits = [e for e in entries if PREFERENCE_MARKERS.search(e["content"] or "")]
    if pref_hits:
        # group loosely by karma prefix so we don't collapse unrelated
        # preferences into one undifferentiated proposal
        pref_by_prefix: dict[str, list[dict]] = defaultdict(list)
        for e in pref_hits:
            pref_by_prefix[_karma_prefix(e["karma"])].append(e)
        for prefix, group in pref_by_prefix.items():
            rule = (
                f"{len(group)} entr{'y' if len(group)==1 else 'ies'} under "
                f"'{prefix}' state an explicit standing preference. Review and "
                f"promote the ones that should bind future work in this domain."
            )
            result = store.stage_proposal(
                session_id=session_id,
                rule=rule,
                domain=f"explicit-preference:{prefix}",
                notes="Heuristic: content matched a preference/standing-rule marker phrase.",
                source_entry_ids=[e["entry_id"] for e in group],
            )
            proposals.append({**result, "rule": rule, "domain": f"explicit-preference:{prefix}"})

    # 3. recurring-gotcha
    gotcha_hits = [e for e in entries if GOTCHA_MARKERS.search(e["content"] or "")]
    if len(gotcha_hits) >= 2:
        rule = (
            f"{len(gotcha_hits)} entries flag a technical gotcha/bug/lesson. "
            f"Consider consolidating these into a project CODING-NOTES.md so "
            f"they survive independent of smriti recall."
        )
        result = store.stage_proposal(
            session_id=session_id,
            rule=rule,
            domain="recurring-gotcha",
            notes="Heuristic: content matched a gotcha/bug/technical-note marker phrase.",
            source_entry_ids=[e["entry_id"] for e in gotcha_hits],
        )
        proposals.append({**result, "rule": rule, "domain": "recurring-gotcha"})

    return proposals


def find_conflicts(store: SmritiStore) -> list[dict]:
    """Flag pairs of entries in the same karma-prefix whose content contains
    opposite sides of a known negation pair (e.g. one says "no bullets", a
    later one says "use bullets"). This is the "conflict test" from the
    original measurement plan. Heuristic and shallow by design — it is meant
    to surface candidates for human review, not to adjudicate automatically.
    """
    entries = store.all_entries()
    by_prefix: dict[str, list[dict]] = defaultdict(list)
    for e in entries:
        by_prefix[_karma_prefix(e["karma"])].append(e)

    conflicts = []
    for prefix, group in by_prefix.items():
        texts = [(e, (e["content"] or "").lower()) for e in group]
        for neg, pos in NEGATION_PAIRS:
            neg_entries = [e for e, t in texts if neg in t]
            pos_entries = [e for e, t in texts if pos in t]
            if neg_entries and pos_entries:
                conflicts.append(
                    {
                        "karma_prefix": prefix,
                        "pattern": f"{neg!r} vs {pos!r}",
                        "entries_for_neg": [e["entry_id"] for e in neg_entries],
                        "entries_for_pos": [e["entry_id"] for e in pos_entries],
                    }
                )
    return conflicts


def duplicate_candidates(store: SmritiStore, threshold: float = 0.6) -> list[dict]:
    """Token-overlap check for the "duplicate-work" behavioral probe.

    For each karma-prefix, compares every pair of entries' content token
    sets; flags pairs above the overlap threshold as likely duplicate work
    that smriti recall should have prevented.
    """
    entries = store.all_entries()
    by_prefix: dict[str, list[dict]] = defaultdict(list)
    for e in entries:
        by_prefix[_karma_prefix(e["karma"])].append(e)

    def tokens(text: str) -> set[str]:
        return set(re.findall(r"[a-zA-Z0-9']{4,}", (text or "").lower()))

    dupes = []
    for prefix, group in by_prefix.items():
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                a, b = group[i], group[j]
                ta, tb = tokens(a["content"]), tokens(b["content"])
                if not ta or not tb:
                    continue
                overlap = len(ta & tb) / max(1, len(ta | tb))
                if overlap >= threshold:
                    dupes.append(
                        {
                            "karma_prefix": prefix,
                            "overlap": round(overlap, 3),
                            "entry_a": a["entry_id"],
                            "entry_b": b["entry_id"],
                        }
                    )
    return dupes
