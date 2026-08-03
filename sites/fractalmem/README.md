# SKAA — a portable, installable smrti (memory) harness

SKAA gives an AI agent a persistent, structured episodic memory — exposed as an MCP server, backed by a per-project SQLite file, built around a Sanskrit grammatical ontology (karaka roles for who-did-what-to- what, pramana for how the agent knows what it's claiming) rather than a flat "notes" log.

This package generalizes an existing SKAA harness (in production use since June 2026 across Chat, Cowork, and Code sessions for one user) into something installable in *any* project, and adds the measurement harness — recall probes, a metrics script, a daily log, weekly behavioral probes — that an earlier integration plan specified in detail but, per a July 29, 2026 audit of real usage, never actually got built. This package builds it for real, tests it, and documents where the design still has open edges rather than pretending it's finished.

## Quickstart

```bash
./scripts/install.sh /path/to/your/project
# paste the printed MCP config block into your client's config
# restart the client, then call skaa_status to confirm
```

Full walkthrough: **[INSTALL.md](INSTALL.md)**.

## What's in this package

```
skaa-package/
├── README.md                  — you are here
├── INSTALL.md                 — step-by-step install/uninstall/troubleshooting
├── CHECKLIST.md                — day-3/week-1/week-4 measurement cadence
├── .env.example
├── server/                     — the MCP server itself
│   ├── pyproject.toml
│   ├── skaa_server.py           — entrypoint; also runnable with --selftest
│   ├── skaa/
│   │   ├── models.py             — pramana/karaka/dhatu data model
│   │   ├── db.py                 — SQLite storage (skaa/smriti.db)
│   │   ├── tools.py               — plain-function tool logic (transport-agnostic)
│   │   └── samskara.py            — proposal mining + conflict/duplicate heuristics
│   └── tests/test_skaa.py       — 18 passing tests, run with pytest
├── scripts/
│   ├── install.sh                — installs into a target project
│   ├── uninstall.sh              — removes it (keeps smriti.db unless --purge)
│   ├── smriti-metrics.sh          — fast sqlite3-only health check
│   ├── memory-probes.yaml         — recall probe definitions (edit per project)
│   ├── run_probes.py              — runs the recall probes, logs results
│   └── behavioral_probes.py       — duplicate-work / convention-recall / conflict checks
├── docs/
│   ├── ARCHITECTURE.md            — the ontology, tool reference, roadmap
│   ├── SUTRAS.md                  — the numbered rulebook (SYS-01..SYS-08)
│   ├── ADR-001-schema.md          — why SQLite-per-project, alternatives considered
│   └── metrics/SMRITI-LOG.md      — template daily log (a copy goes to your project root)
└── config/
    └── mcp.config.example.json  — MCP client config snippet
```

## The core idea, in one paragraph
Every memory entry is forced to answer two questions honestly: how do you know this (pramana: did you see it yourself, infer it, hear it secondhand, or reason by analogy), and who-did-what-to-what (karaka roles: agent, object, instrument, beneficiary, source, context — Panini's six karakas, with only agent and object mandatory). A third, looser tag (`dhatu_cluster`) names the verbal root of the action itself. None of this is decoration — see `docs/SUTRAS.md` for why each rule exists, and `docs/ARCHITECTURE.md`'s audit section for what happens when the discipline slips (spoiler: everything quietly becomes `pratyaksa` / `kr` and the classification stops doing any work).

## Honest status
This is a from-scratch, generalized reference implementation built to match the tool contract of an existing production harness (see`server/tests/test_skaa.py` for what's verified: 18 tests, all passing, covering the db layer, the samskara heuristics, and the tool surface end to end). It is **not** a copy of that harness's original source code — this package doesn't have access to that codebase, only to what its own tool schemas and five weeks of logged usage revealed about how it's meant to behave. Two things are intentionally left as documented stubs rather than faked as complete: `skaa_execute` is a keyword-based dhatu classifier, not a full orchestrator (SYS-07); and recall in `skaa_memory_query` is token-overlap search, not semantic/embedding search. Both are named explicitly in `docs/ARCHITECTURE.md`'s roadmap section.
