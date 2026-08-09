---
title: "Overview"
description: "A concise mental model for Fractal Agentic: identity, domain bosses, the delivery runtime, the armory, and optional knowledge systems."
type: guide
---

# Overview

Fractal Agentic is an Engineering Capability Collection (ECC) for coding agents. It gives a project a stable operating model: choose the domain that owns the work, use a delivery runtime to carry it through implementation and review, and pull local skills, agents, and commands as needed.

The package is host-agnostic at its core. It is tuned for the Fractal defaults—Svelte 5, SvelteKit, and indented SASS—but the project mandate and delivery process can be used with any stack.

## What ships

| Layer | What it provides | Start with |
| --- | --- | --- |
| Identity and startup | Portable principles plus precedence, selection, and stop-reading rules | [`SOUL.md`](../SOUL.md) and the [startup router](../AGENTS.md) |
| Domain playbooks | Seven bosses that own different kinds of work | [Domain bosses](./bosses/INDEX.md) |
| Delivery runtime | Boss selection, implementation, verification, and review | [`/orchestrate`](../../commands/orchestrate.md) and [Orchestration](./orchestration/INDEX.md) |
| Armory | Vendored skills, specialist agents, slash commands, and scripts | [Armory](./armory/INDEX.md) |
| Optional systems | Wiki, hooks, and local self-improvement | [Optional systems](./INDEX.md#optional-systems) |

The live inventories are separate from the narrative guide. Browse [skills](/skills), [agents](/agents), and [commands](/commands) when you need an asset by name.

## The operating model

```text
User request
    │
    ▼
Read router → choose one boss  Domain axis: what kind of work is this?
    │
    ▼
Run /orchestrate             Delivery axis: how will the work be accepted?
    │
    ├── implement              Primary session or an available capability lane
    ├── verify                 Real diff, real commands, primary ownership
    └── review                 ship | fix-first | rethink
    │
    ▼
Optionally capture knowledge  Wiki episode or local improvement data
```

The boss supplies the constraints and points to the relevant armory. `/orchestrate` supplies the delivery contract. The optional wiki and self-improvement systems preserve what the session learned; neither one is required to ship.

## The plugin root

The installable unit is the `plugin/` directory, whether it comes from a marketplace install, a local checkout, or a copied plugin directory. It contains the manifest, identity files, armory, commands, scripts, and shipped support docs.

Set the root explicitly when a host or shell needs a path:

```sh
export FRACTAL_AGENTIC_ROOT=/absolute/path/to/fractal-agentic/plugin
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
```

The repository root may also contain the website and marketplace catalogs. Those are useful for humans and distribution, but agents should resolve the installable `plugin/` directory.

## How a task moves through the system

1. **Detect the plugin and read the project rules.** The project’s `AGENTS.md` remains authoritative for local conventions.
2. **Read the startup router and select one boss.** Use the [decision hub](./bosses/INDEX.md), then read only that nested playbook.
3. **Set capability mode.** Use available pins when the host exposes them; otherwise continue in a documented fallback mode.
4. **Implement and verify.** The primary session owns the real diff and command results, even when another agent helps implement.
5. **Review the result.** The review outcome is `ship`, `fix-first`, or `rethink`.
6. **Capture knowledge when useful.** A configured wiki may receive an episode after delivery.

## Choose your next page

| Your situation | Next page |
| --- | --- |
| New install | [Getting started](./01-getting-started.md) |
| Host-specific install | [Install](./02-install.md) |
| Project does not load the plugin automatically | [Auto-use mandate](./03-auto-use.md) |
| Unsure which boss to use | [Domain bosses](./bosses/INDEX.md) |
| Ready to understand delivery mechanics | [Runtime loop](./orchestration/runtime.md) |
| Missing pins or an optional system failed | [Non-blocking policy](./progression.md) |
| Looking for a particular capability | [Armory](./armory/INDEX.md) |
