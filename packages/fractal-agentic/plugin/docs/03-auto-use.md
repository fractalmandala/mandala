---
title: "Auto-use mandate"
description: "Make coding agents detect and use Fractal Agentic from a project AGENTS.md without a per-session plugin mention."
type: guide
---

# Auto-use mandate

The project mandate is the bridge between an installed plugin and a working project. Once it is in the project’s `AGENTS.md`, agents can detect Fractal Agentic, use its startup router and delivery runtime, and avoid a per-session plugin mention.

## Add the mandate

Copy the canonical block from [`project-integration/AGENTS-SNIPPET.md`](../project-integration/AGENTS-SNIPPET.md) near the top of the project’s `AGENTS.md`. A root `AGENTS.md` is enough for a monorepo when its projects inherit that file.

The block is intentionally a soft bootstrap. It asks an agent to try the plugin and continue under project rules if detection fails.

## What the mandate asks an agent to do

When the plugin is available, the agent should:

1. resolve the plugin root from `FRACTAL_AGENTIC_ROOT` or the filesystem;
2. read the startup `AGENTS.md`, select exactly one nested boss playbook, and read `SOUL.md` only when relevant;
3. load `boss-orchestration` for non-trivial work;
4. use `/orchestrate` for work that changes the repository or claims completion; and
5. continue in a degraded mode when pins, hooks, or the wiki are absent.

If detection fails, the agent should say once that Fractal Agentic was not found and continue with the project’s own rules. It should not invent a path or refuse the task.

## Environment variables

```sh
export FRACTAL_AGENTIC_ROOT=/absolute/path/to/fractal-agentic/plugin
export FRACTAL_WIKI_ROOT=/absolute/path/to/wiki-vault  # optional
```

Verify the plugin path with:

```sh
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
```

The root must contain `plugin.json`, the `AGENTS.md` startup router,
`docs/bosses/INDEX.md`, all seven nested boss `INDEX.md` playbooks,
`skills/boss-orchestration/SKILL.md`, and `commands/orchestrate.md`.

## Conflict rule

Project-local instructions win when they describe the project’s stack, architecture,
conventions, or safety requirements. Fractal Agentic supplies a process, one-boss
routing, and an armory; it does not override the project’s own contract.

| Project owns | Fractal Agentic supplies |
| --- | --- |
| Stack and repository conventions | One-boss selection and domain boundaries |
| Product requirements and local safety rules | Delivery contracts and verification discipline |
| Existing architecture and integration constraints | Skills, agents, commands, and optional systems |

## Optional wiki

If `FRACTAL_WIKI_ROOT` resolves, prefer `/wiki-query` for prior project knowledge and allow `/orchestrate` to capture an episode when configured. A missing or unavailable wiki is normal; it does not change the delivery path. See the [Wiki hub](./wiki/INDEX.md).
