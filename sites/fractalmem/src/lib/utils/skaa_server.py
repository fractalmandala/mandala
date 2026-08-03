#!/usr/bin/env python3
"""
SKAA MCP server entrypoint.

Run directly for a smoke test:
    python skaa_server.py --selftest

Run as an MCP server (stdio transport, what Claude Desktop/Code expects):
    python skaa_server.py
or, if installed via install.sh with uv:
    uv run --directory /path/to/project/.skaa/server skaa_server.py

Configuration is via environment variables (see .env.example at the
package root):
    SKAA_DB_PATH     — path to the SQLite file (default: .skaa/smriti.db,
                        resolved relative to the process's cwd)
    SKAA_SESSION_ID  — logical session identity (default: "default")
"""

from __future__ import annotations

import sys

from skaa.tools import (
    DEFAULT_DB_PATH,
    DEFAULT_SESSION_ID,
    SkaaContext,
    skaa_execute,
    skaa_memory_query,
    skaa_memory_write,
    skaa_samskara_apply,
    skaa_samskara_proposals,
    skaa_session_close,
    skaa_status,
)

_ctx = SkaaContext(db_path=DEFAULT_DB_PATH, session_id=DEFAULT_SESSION_ID)


def _build_mcp():
    from mcp.server.fastmcp import FastMCP

    mcp = FastMCP("skaa")

    @mcp.tool()
    def status() -> dict:
        """Return current SKAA session state: session ID, smriti count, tools."""
        return skaa_status(_ctx)

    @mcp.tool()
    def memory_query(
        query: str,
        dhatu_cluster: str = "",
        karaka_role: str = "",
        pramana_min: str = "",
        top_k: int = 10,
    ) -> dict:
        """Query SKAA smriti. Returns matching entries sorted by relevance/pramana weight."""
        return skaa_memory_query(_ctx, query, dhatu_cluster, karaka_role, pramana_min, top_k)

    @mcp.tool()
    def memory_write(
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
        """Write an entry to SKAA smriti. pramana must be: pratyaksa | anumana | sabda | upamana."""
        return skaa_memory_write(
            _ctx, content, pramana, karta, karma, dhatu_cluster, karaka_role,
            karana, sampradana, apadana, adhikarana, tags,
        )

    @mcp.tool()
    def session_close() -> dict:
        """Close the SKAA session. Stages samskara proposals and flushes smriti."""
        return skaa_session_close(_ctx)

    @mcp.tool()
    def samskara_proposals(status: str = "pending") -> dict:
        """List samskara proposals. Each has proposal_id, rule, domain, notes. Never auto-applied."""
        return skaa_samskara_proposals(_ctx, status)

    @mcp.tool()
    def samskara_apply(proposal_ids: str) -> dict:
        """Promote pending samskara proposals into durable rules. proposal_ids: comma-separated ids."""
        return skaa_samskara_apply(_ctx, proposal_ids)

    @mcp.tool()
    def execute(instruction: str) -> dict:
        """Run any natural-language instruction through the SKAA orchestrator (routing stub)."""
        return skaa_execute(_ctx, instruction)

    return mcp


def _selftest() -> int:
    """A dependency-free sanity check — proves the tool logic works even
    without the `mcp` package installed, which is useful right after
    install.sh runs, before any MCP client has connected."""
    print("SKAA self-test")
    print("status:", skaa_status(_ctx))
    w = skaa_memory_write(
        _ctx,
        content="Self-test entry written by skaa_server.py --selftest.",
        pramana="pratyaksa",
        karta="skaa_server",
        karma="skaa/selftest",
        dhatu_cluster="kr",
        tags="selftest",
    )
    print("write:", w)
    q = skaa_memory_query(_ctx, "self-test", top_k=3)
    print("query:", q)
    assert q["count"] >= 1, "self-test entry should be recallable"
    print("OK — SKAA core is working.")
    return 0


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        raise SystemExit(_selftest())
    try:
        mcp = _build_mcp()
    except ImportError:
        print(
            "The `mcp` package is not installed. Run `pip install mcp` "
            "(or `uv sync` in this directory) before starting the server, "
            "or run `python skaa_server.py --selftest` to check the core "
            "logic without an MCP client.",
            file=sys.stderr,
        )
        raise SystemExit(1)
    mcp.run()
