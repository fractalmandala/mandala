---
title: "Documentation ownership"
description: "Keep agent policy, dual guides, live inventories, and website presentation in the layer that owns them."
type: guide
---

# Documentation ownership

Fractal Agentic uses one package for agent-required content and a separate site for human presentation. The site renders package Markdown; it is not a second source of truth.

## The three layers

| Layer | Role | Audience |
| --- | --- | --- |
| `packages/fractal-agentic/` | Installable product: identity, startup router, nested boss playbooks, armory, commands, scripts, and shipped support docs | Agents and users |
| `sites/fractalagentic/` | Website chrome, layout, search, catalogs, and presentation of plugin content | Humans in a browser |
| Repository root | Checkout shell, credits, layout notes, and marketplace catalogs | Contributors and distributors |

If an agent needs the content during an offline install, it belongs under
`packages/fractal-agentic/`.

## The package sources of truth

| Asset | Owns |
| --- | --- |
| [`SOUL.md`](../SOUL.md) | Portable identity and principles |
| [`AGENTS.md`](../AGENTS.md) | Startup router: precedence, trivial exemption, one-boss selection, stop-reading rules, and handoff triggers |
| `docs/bosses/<boss>/INDEX.md` | Authoritative boss mission, exclusions, mapped agents/skills/commands, phases, verification defaults, and handoffs |
| `skills/INDEX.md` | Live skill inventory |
| `agents/INDEX.md` | Live specialist-agent inventory |
| `commands/INDEX.md` | Live slash-command inventory |
| `docs/progression.md` | Canonical non-blocking policy |
| `skills/boss-orchestration/` | Executable delivery runtime and reference contracts |
| `docs/orchestration/` | Human navigation for the runtime; links to, never duplicates, executable policy |
| `docs/` | Install, troubleshooting, armory, wiki, policy, and other dual guides |

The project’s local `AGENTS.md` still wins when it defines repository-specific conventions.

## Which docs the site publishes

The site publishes two kinds of documentation surface:

### Narrative section hubs

`packages/fractal-agentic/docs/INDEX.md` and the nested `docs/**/INDEX.md` files are
human-facing landing pages. They explain the sequence and boundaries of a section, so
they appear in the `/docs` reading path:

- `docs/INDEX.md` → `/docs/guide`
- `docs/bosses/INDEX.md` → `/docs/bosses`
- `docs/orchestration/INDEX.md` → `/docs/orchestration`
- `docs/armory/INDEX.md` → `/docs/armory`
- `docs/wiki/INDEX.md` → `/docs/wiki`
- `docs/svelte-framework/INDEX.md` → `/docs/svelte-framework`

These hubs are part of the shipped docs and should be kept short enough to orient a reader.

### Live armory catalogs

`skills/INDEX.md`, `agents/INDEX.md`, and `commands/INDEX.md` are different. They are the canonical inventories beside the assets they index, and the site exposes them as `/skills`, `/agents`, and `/commands`. Link to those catalogs from the docs; do not copy their full lists into a narrative guide or add them to the docs reading sequence.

This split gives the reader a clear path while keeping inventory changes in one place.

## Boss documentation

Boss ownership uses progressive discovery:

| Layer | Location | Contents |
| --- | --- | --- |
| Startup router | `AGENTS.md` | Precedence, one-boss decision table, stack gate, handoffs, stop-reading rules |
| Authoritative boss playbook | `docs/bosses/<boss>/INDEX.md` | Mission, mappings, phases, verification defaults, and handoffs |
| Boss hub | `docs/bosses/INDEX.md` | Decision tree, boundaries, and navigation to nested playbooks |

Do not maintain a second full armory list in a hub, router, or command. The nested
boss `INDEX.md` wins for its domain; live asset `INDEX.md` files win for availability.

## Editing rules

| Change | Edit first |
| --- | --- |
| Boss gains or loses a capability | Its nested `docs/bosses/<boss>/INDEX.md`, then the relevant live index |
| When a boss should be chosen | `AGENTS.md` decision table and `docs/bosses/INDEX.md` |
| Install or packaging behavior | `docs/02-install.md` and the package README when the front door changes |
| Non-blocking or pin policy | `docs/progression.md` and the orchestration runtime if the procedure changes |
| Wiki, hooks, or self-improvement setup | The matching guide under `docs/` and its command/skill source |
| Website navigation or styling | `sites/fractalagentic/` only; keep product facts in `packages/fractal-agentic/` |
| Skill, agent, or command added or removed | The asset, its live `INDEX.md`, and the owning nested boss playbook |

After a structural docs change, check relative links, frontmatter, the live inventory, and the site route that renders the page.

## Related

- [Documentation guide](./INDEX.md)
- [Overview](./00-overview.md)
- [Armory](./armory/INDEX.md)
- [`CUSTOMIZE.md`](../CUSTOMIZE.md)
