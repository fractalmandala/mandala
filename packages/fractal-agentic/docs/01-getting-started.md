---
title: "Getting started"
description: "Install Fractal Agentic, connect it to a project, and run a first delivery in one short session."
type: guide
---

# Getting started

This is the shortest path from an empty host to a real Fractal Agentic delivery:

1. install the plugin;
2. point the host at the plugin root;
3. add the project auto-use mandate; and
4. run one task through `/orchestrate`.

The [install guide](./02-install.md) has the complete host matrix. Use this page when you want the fast path.

## 1. Install the plugin

For most machines, start with the installer:

```sh
npx fractal-agentic install
```

For a host-specific install, pass a target such as `antigravity`, `claude`, or `codex`:

```sh
npx fractal-agentic install --target=antigravity
```

If you are working from a checkout, the plugin root is the `plugin/` directory:

```sh
git clone --filter=blob:none --sparse https://github.com/fractalmandala/fractal-agentic.git
cd fractal-agentic
git sparse-checkout set plugin .agents .claude-plugin
export FRACTAL_AGENTIC_ROOT="$PWD/plugin"
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
```

Host-specific marketplace commands are in [Install](./02-install.md).

## 2. Connect a project

Copy [`project-integration/AGENTS-SNIPPET.md`](../project-integration/AGENTS-SNIPPET.md) near the top of the project’s `AGENTS.md`. A monorepo can place the block in its root `AGENTS.md` when its projects inherit that file.

The mandate tells an agent to detect the plugin, read the startup router, select one
boss playbook, use the delivery runtime for non-trivial work, and continue if optional
capabilities are unavailable. See [Auto-use mandate](./03-auto-use.md) for the full behavior.

## 3. Verify the root

If the host does not manage the root for you, set it in the shell or host environment and run the probe:

```sh
export FRACTAL_AGENTIC_ROOT=/absolute/path/to/fractal-agentic/plugin
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
```

The command should print the resolved plugin directory. Read [`SOUL.md`](../SOUL.md)
for portable principles and the [startup router](../AGENTS.md) for the one-boss path.

## 4. Run a first delivery

Use a small but real change in a project with the mandate installed:

1. describe the change and its acceptance criteria;
2. choose one boss, for example `/activate-boss-svelte`, and read only its playbook;
3. run `/orchestrate`;
4. inspect the diff and verification output; and
5. close with `ship`, `fix-first`, or `rethink`.

The primary session owns verification. If a capability pin is unavailable, the work continues with a documented degraded mode; do not wait for an optional install to begin.

## Optional additions

Add these only when they solve a problem you have:

| Need | Setup | Guide |
| --- | --- | --- |
| More specialized implementation or review lanes | `sh scripts/install-agents.sh` | [Capability lanes](./orchestration/capability-lanes.md) |
| A shared, durable project memory | `/wiki-init` | [Wiki setup](./wiki/setup.md) |
| Lifecycle safety and quality hooks | `/hooks-init` | [Hooks](./hooks.md) |
| Local observations and improvement proposals | `/improve-init` | [Self-improvement](./self-improvement.md) |

These systems are optional. Their absence must not stop delivery; [progression.md](./progression.md) defines the fallback.

## First-session checklist

- [ ] Plugin installed or `FRACTAL_AGENTIC_ROOT` resolves
- [ ] Project mandate copied into `AGENTS.md`
- [ ] A real task selected
- [ ] Active boss selected or delegated to `/orchestrate`
- [ ] `/orchestrate` completed with a review verdict
- [ ] Optional pins, wiki, hooks, or self-improvement enabled only if useful

Next: [Runtime loop](./orchestration/runtime.md) explains what `/orchestrate` does after setup.
