---
title: "Commands"
description: "Commands are Markdown playbooks exposed by hosts as slash commands such as /orchestrate and /quality-gate."
type: guide
---

# Commands

Commands are Markdown playbooks under `commands/`. Hosts expose them as `/name`; the command file describes the inputs, process, and expected result.

Browse the [live commands index](../../commands/INDEX.md) or [commands explorer](/commands) for the complete inventory.

## Start with these groups

| Group | Examples | Use |
| --- | --- | --- |
| Boss activation | `/activate-boss-design`, `/activate-boss-code`, `/activate-boss-svelte`, and the other boss commands | Load the router and one authoritative domain playbook |
| Delivery and quality | `/orchestrate`, `/quality-gate`, `/security-scan`, `/code-review`, `/santa-loop` | Implement, verify, and review work |
| Stack-specific | `/svelte-review`, `/svelte-build`, `/svelte-test`, plus secondary stack commands | Apply a stack-aware workflow |
| Knowledge | `/wiki-init`, `/wiki-status`, `/wiki-capture`, `/wiki-ingest`, `/wiki-query`, `/wiki-lint` | Set up and operate the optional wiki |
| Session systems | `/hooks-init`, `/hooks-status`, `/improve-init`, `/improve-status` | Configure optional local automation |
| Personal workflow | `/learn`, `/instinct-*`, `/loop-*`, `/promote`, `/prune`, `/skill-health` | Manage personal learning and portfolio health |

The command index is the source for what currently exists. This page groups the surface so a new user can choose a starting point without copying a list that will age.

## Writing or changing a command

Keep a command’s frontmatter `description` useful for discovery. Link to the skills and references it needs, state the verification step, and preserve the non-blocking rule for optional systems. When a command changes:

1. edit the command file under `plugin/commands/`;
2. update [`commands/INDEX.md`](../../commands/INDEX.md);
3. update the relevant nested boss playbook under [`docs/bosses/`](../bosses/INDEX.md); and
4. run the package checks that cover the command.

For the main delivery path, start with [`/orchestrate`](../../commands/orchestrate.md) and then read [Runtime loop](../orchestration/runtime.md).
