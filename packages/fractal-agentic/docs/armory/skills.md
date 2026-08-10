---
title: "Skills"
description: "Skills are local SKILL.md packages that teach agents when and how to perform a class of work."
type: guide
---

# Skills

A skill is a local `SKILL.md` package with a name, description, operating instructions, and optional references or scripts. Skills are the armory’s reusable knowledge layer: a boss maps to the right skills, and the agent loads the relevant ones for the task.

## Find a skill

1. Start with the active boss's [nested playbook](../bosses/INDEX.md); its mapped
   skills are the preferred entry point.
2. Search the [live skills index](../../skills/INDEX.md) for the complete inventory.
3. Open the [skills explorer](/skills) when you want to filter or browse in a browser.
4. Read the skill’s frontmatter and full `SKILL.md` before using it.

Frontmatter `name` and `description` help hosts decide when a skill should be discoverable. The body defines the actual procedure. Optional `references/`, `scripts/`, and examples extend the procedure without changing the skill’s identity.

## Common skill families

| Family | Examples | Typical owner |
| --- | --- | --- |
| Delivery kernel | `boss-orchestration` | Every boss |
| General utility | `academic-research`, `docs-writer`, `human-writing`, `file-organizer`, `visual-design` | Any session |
| Svelte implementation | Svelte 5 runes, SvelteKit structure and data flow | Svelte |
| Design craft | `design-system`, `impeccable`, motion, accessibility | Design |
| Quality and security | security review, TDD, E2E, performance | Code |
| Product agent systems | harness, evaluation, MCP, memory | Agent |
| Continuous knowledge | `llm-wiki` | Agent or Workflow |
| Plugin portfolio | stocktake, comply, create, promote, prune | Meta |

These are clusters, not a second inventory. Use the live index for the complete list
and the owning boss playbook for domain ownership.

## Canonical names and aliases

Some pairs are intentionally related:

| Canonical skill | Related detail |
| --- | --- |
| `svelte-5-runes` | `svelte-runes` is the reference pack |
| `continuous-agent-loop` | `autonomous-loops` contains implementation detail |

Check the skill frontmatter and index before assuming two similarly named skills are interchangeable.

## Add or change a skill

Use [`CUSTOMIZE.md`](../../CUSTOMIZE.md) for package extension rules. A complete change normally updates:

- the skill directory and its `SKILL.md`;
- the live [`skills/INDEX.md`](../../skills/INDEX.md);
- the relevant nested boss playbook under [`docs/bosses/`](../bosses/INDEX.md); and
- any tests or checks needed by the skill.

Run `scripts/check-armory.sh` after changing a critical skill. Keep the source local to
`packages/fractal-agentic/` so an offline install can use it.
