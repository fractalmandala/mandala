---
title: "Agents"
description: "Agent files provide specialist perspectives; optional TOML pins give orchestration lanes a host-recognized role."
type: guide
---

# Agents

The `agents/` directory contains two related surfaces. Markdown files describe specialist roles; TOML templates describe optional capability pins that a host may expose as spawn types.

## Specialist agents

Domain specialists include reviewers, architects, explorers, and optimizers. A host may invoke them by name, or the primary session may use their files as focused review and implementation playbooks.

Browse the [live agents index](../../agents/INDEX.md) or [agents explorer](/agents)
for the complete list. The active [nested boss playbook](../bosses/INDEX.md) explains
which specialists are primary for its domain.

## Capability pins

The optional `fractal-agentic-*.toml` templates install host-recognized roles for orchestration lanes:

| Lane | Spawn type |
| --- | --- |
| Routine implementer | `fractal_agentic_routine_implementer` |
| Complex implementer | `fractal_agentic_complex_implementer` |
| Fresh reviewer | `fractal_agentic_fresh_reviewer` |

Install them from the plugin root when the host supports custom agents:

```sh
sh scripts/install-agents.sh
```

A successful disk install does not prove that the current session exposes the spawn types. See [Capability lanes](../orchestration/capability-lanes.md) for the distinction and the fallback path.

## Use agents safely

- Use a specialist to narrow a question or review a change; keep ownership of the real diff in the primary session.
- Do not invent a spawn type that is absent from the host’s current catalog.
- Treat worker reports as claims until the primary session verifies the commands and result.
- Keep optional pins non-blocking. Missing lanes should produce a documented fallback mode, not a refused task.

When adding an agent, update the Markdown file, the live
[`agents/INDEX.md`](../../agents/INDEX.md), and the relevant nested boss playbook.
