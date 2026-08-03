"""
Tool logic, decoupled from any MCP transport.

skaa_server.py just imports this module and wraps each function with an
@mcp.tool() decorator. Keeping the logic here (plain functions, plain
dicts in/out) means it can be unit-tested without a running MCP client
and could be re-wrapped for a different transport later without touching
a line of actual behavior.

Tool names below match the ones already live in the original SKAA harness
(skaa_status, skaa_memory_query, skaa_memory_write, skaa_session_close,
skaa_samskara_proposals) plus two new ones this package adds:
skaa_samskara_apply (referenced by the original but not yet inspected)
and skaa_execute (the natural-language dispatcher).
"""

from __future__ import annotations

import os
import re
from pathlib import Path

from .db import SmritiStore
from .models import SUGGESTED_DHATU_ROOTS
from .samskara import mine_proposals

DEFAULT_DB_PATH = os.environ.get("SKAA_DB_PATH", ".skaa/smriti.db")
DEFAULT_SESSION_ID = os.environ.get("SKAA_SESSION_ID", "default")

# The four dhatu tool categories the original harness reports under
# skaa_status (tool_count: 4). skaa_execute below classifies a
# natural-language instruction into one of these as a first-pass router.
DHATU_TOOLS = {
    "dris": "to see — observation/reading/review actions",
    "kri": "to make/do — creation/build/write actions",
    "gam": "to go — search/navigate/traverse actions",
    "vad": "to speak — communicate/report/explain actions",
}

_DHATU_KEYWORDS = {
    "dris": ["look", "read", "review", "check", "inspect", "audit", "see", "view"],
    "kri": ["create", "build", "write", "make", "generate", "implement", "fix", "draft"],
    "gam": ["find", "search", "navigate", "locate", "go to", "list", "explore"],
    "vad": ["explain", "summarize", "report", "tell", "describe", "present", "say"],
}


class SkaaContext:
    """Holds one open SmritiStore + session_id for the life of the server process."""

    def __init__(self, db_path: str | Path = DEFAULT_DB_PATH, session_id: str = DEFAULT_SESSION_ID):
        self.store = SmritiStore(db_path)
        self.session_id = session_id
        self.store.touch_session(session_id)

    def close(self) -> None:
        self.store.close()


def skaa_status(ctx: SkaaContext) -> dict:
    return {
        "ok": True,
        "session_id": ctx.session_id,
        "db_path": str(ctx.store.db_path),
        "smriti_count": ctx.store.count(),
        "tool_count": len(DHATU_TOOLS),
        "tools": list(DHATU_TOOLS.keys()),
        "pending_proposals": len(ctx.store.list_proposals("pending")),
    }


def skaa_memory_query(
    ctx: SkaaContext,
    query: str,
    dhatu_cluster: str = "",
    karaka_role: str = "",
    pramana_min: str = "",
    top_k: int = 10,
) -> dict:
    results = ctx.store.query(
        query,
        dhatu_cluster=dhatu_cluster,
        karaka_role=karaka_role,
        pramana_min=pramana_min,
        top_k=top_k,
    )
    return {
        "ok": True,
        "session_id": ctx.session_id,
        "count": len(results),
        "entries": results,
    }


def skaa_memory_write(
    ctx: SkaaContext,
    content: str,
    pramana: str,
    karta: str,
    karma: str,
    dhatu_cluster: str = "",
    karaka_role: str = "",
    karana: str = "",
    sampradana: str = "",
    apadana: str = "",
    adhikarana: str = "",
    tags: str = "",
) -> dict:
    try:
        result = ctx.store.write(
            session_id=ctx.session_id,
            content=content,
            pramana=pramana,
            karta=karta,
            karma=karma,
            karana=karana,
            sampradana=sampradana,
            apadana=apadana,
            adhikarana=adhikarana,
            dhatu_cluster=dhatu_cluster,
            karaka_role=karaka_role,
            tags=tags,
        )
    except ValueError as e:
        return {"ok": False, "error": str(e)}
    return {"ok": True, "session_id": ctx.session_id, **result}


def skaa_session_close(ctx: SkaaContext) -> dict:
    proposals = mine_proposals(ctx.store, ctx.session_id)
    ctx.store.close_session(ctx.session_id)
    return {
        "ok": True,
        "session_id": ctx.session_id,
        "smriti_count": ctx.store.count(),
        "proposals_staged": len(proposals),
        "note": (
            "Proposals are staged only, never auto-applied (SYS-03). "
            "Call skaa_samskara_proposals to review, then skaa_samskara_apply "
            "with specific proposal_ids to promote."
        ),
    }


def skaa_samskara_proposals(ctx: SkaaContext, status: str = "pending") -> dict:
    proposals = ctx.store.list_proposals(status=status)
    return {"ok": True, "session_id": ctx.session_id, "count": len(proposals), "proposals": proposals}


def skaa_samskara_apply(ctx: SkaaContext, proposal_ids: list[str] | str) -> dict:
    if isinstance(proposal_ids, str):
        proposal_ids = [p.strip() for p in proposal_ids.split(",") if p.strip()]
    result = ctx.store.apply_proposals(proposal_ids)
    return {"ok": True, "session_id": ctx.session_id, **result}


def _classify_dhatu(instruction: str) -> str:
    text = instruction.lower()
    scores = {d: 0 for d in DHATU_TOOLS}
    for dhatu, keywords in _DHATU_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                scores[dhatu] += 1
    best = max(scores, key=lambda d: scores[d])
    if scores[best] == 0:
        return "vad"  # default to "speak" — safest no-op classification
    return best


def skaa_execute(ctx: SkaaContext, instruction: str) -> dict:
    """A minimal, honest v1 of the orchestrator.

    This does NOT run arbitrary tools or call out to an LLM — that would
    require this package to embed its own agent loop and API credentials,
    which is out of scope for something meant to drop into any project.
    What it does: classifies the instruction into one of the four dhatu
    categories using keyword heuristics, records the dispatch decision as
    a pratyaksa smriti entry (so the routing itself is auditable), and
    returns the classification for the caller (typically the surrounding
    agent) to act on. Treat this as a routing stub to extend, not a
    finished orchestrator — see ARCHITECTURE.md's roadmap section.
    """
    dhatu = _classify_dhatu(instruction)
    write_result = ctx.store.write(
        session_id=ctx.session_id,
        content=f"skaa_execute classified instruction into dhatu={dhatu}: {instruction!r}",
        pramana="pratyaksa",
        karta="skaa_execute",
        karma="skaa/execute-dispatch",
        dhatu_cluster=dhatu,
        tags="execute,dispatch",
    )
    return {
        "ok": True,
        "session_id": ctx.session_id,
        "instruction": instruction,
        "dhatu": dhatu,
        "dhatu_meaning": DHATU_TOOLS[dhatu],
        "logged_entry_id": write_result["entry_id"],
        "note": "Routing stub only — see skaa_execute docstring / ARCHITECTURE.md roadmap.",
    }
