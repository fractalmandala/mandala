---
title: "Documentation guide"
description: "Start here for the Fractal Agentic mental model, installation path, delivery runtime, armory, and optional systems."
type: guide
---

# Documentation guide

This is the human and offline guide to Fractal Agentic. It explains what the plugin does, how to install it, how a delivery moves through the system, and where to go when you need a particular capability.

The same Markdown ships inside `plugin/docs/` and is rendered by the website. The website adds navigation and search; the plugin files remain the portable source for offline use.

## The recommended path

Read the guides in this order when you are new to the plugin:

1. [Overview](./00-overview.md) — build the mental model.
2. [Getting started](./01-getting-started.md) — install the plugin and run one delivery.
3. [Install](./02-install.md) — choose a host or troubleshoot packaging details.
4. [Auto-use mandate](./03-auto-use.md) — make the plugin available to every project session.
5. [Domain bosses](./bosses/INDEX.md) — choose one owner and read its authoritative playbook.
6. [Orchestration](./orchestration/INDEX.md) — understand capability lanes, verification, and review after selection.
7. [Armory](./armory/INDEX.md) — browse the skills, agents, and commands available to each boss.
8. [Continuous wiki](./wiki/INDEX.md) — add optional long-term project memory.

After that, use [Troubleshooting](./troubleshooting.md), the [Glossary](./glossary.md), and the reference guides as needed.

## What is published where

There are two kinds of index files in the package, and they serve different purposes.

### Human-facing section hubs

These files live under `plugin/docs/`:

- `docs/INDEX.md` is this guide and the root of the reading path.
- `docs/bosses/INDEX.md`, `docs/orchestration/INDEX.md`, `docs/armory/INDEX.md`, and `docs/wiki/INDEX.md` introduce their sections.
- The site publishes these hubs as `/docs/guide`, `/docs/bosses`, `/docs/orchestration`, `/docs/armory`, and `/docs/wiki`.

They are worth publishing because they explain how the pieces fit together. They are not inventories.

### Live armory inventories

These files live beside the assets they index:

- [`skills/INDEX.md`](../skills/INDEX.md) → browse at `/skills`
- [`agents/INDEX.md`](../agents/INDEX.md) → browse at `/agents`
- [`commands/INDEX.md`](../commands/INDEX.md) → browse at `/commands`

They are the canonical lists of available assets. The website gives each inventory its
own catalog route, so the docs sequence links to those routes instead of copying the
lists into this guide. If an inventory and a narrative guide disagree, the live
inventory wins; the owning nested boss playbook resolves domain mapping.

## Start here

| If you want to… | Read |
| --- | --- |
| Understand the product shape | [Overview](./00-overview.md) |
| Install it on a host | [Install](./02-install.md) |
| Make a project load it automatically | [Auto-use mandate](./03-auto-use.md) |
| Run a feature, fix, or refactor through the delivery loop | [Runtime loop](./orchestration/runtime.md) |
| Decide which domain owns a task | [Domain bosses](./bosses/INDEX.md) |
| Find a skill, agent, or command | [Armory](./armory/INDEX.md) or the [live explorer](https://fractal-agentic.vercel.app/) |
| Add durable project knowledge | [Wiki setup](./wiki/setup.md) |
| Understand graceful failure | [Non-blocking policy](./DEGRADATION.md) |

## Source of truth

The package has a deliberate split:

| Asset | Role |
| --- | --- |
| [`SOUL.md`](../SOUL.md) | Portable identity and principles |
| [`AGENTS.md`](../AGENTS.md) | Startup router: precedence, one-boss selection, stop-reading, and handoffs |
| `docs/bosses/<boss>/INDEX.md` | Authoritative mission, armory mapping, phases, verification, and handoffs for that boss |
| `plugin/docs/` | Dual guides and policy that ship with the plugin |
| `skills/`, `agents/`, `commands/` | Runtime assets and their live inventories |
| [`README.md`](../README.md) | Package-level front door and install summary |

The [documentation ownership guide](./doc-ownership.md) explains which file to edit when
the package changes. Put agent-required facts in `plugin/`, keep the router concise,
keep each boss playbook self-contained, and let the site render the package rather
than becoming a second source of truth.

## Optional systems

The delivery kernel works without these additions:

- [Hooks](./hooks.md) add host and project lifecycle automation.
- [Self-improvement](./self-improvement.md) stores local observations and improvement proposals.
- [Continuous wiki](./wiki/INDEX.md) compounds project knowledge across sessions.
- [Scheduled essays](./scheduled-essays.md) turn captured local knowledge into a validated post every 48 hours.

All four follow the same rule: they can improve a session, but they never gate product work. See [DEGRADATION.md](./DEGRADATION.md).
