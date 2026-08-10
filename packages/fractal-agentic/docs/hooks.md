---
title: "Optional hooks"
description: "Session automation for hosts that support lifecycle hooks. Not part of the delivery kernel — /orchestrate works without them."
type: guide
---

# Optional hooks

Session automation for hosts that support lifecycle hooks.  
**Not part of the delivery kernel** — `/orchestrate` works without them.

| | |
|---|---|
| **Package** | `hooks/README.md` |
| **User setup** | **`/hooks-init`** (recommended) or `scripts/install-hooks.sh` |
| **Status** | **`/hooks-status`** or `install-hooks.sh --check` |
| **Default profile** | `minimal` |
| **Owner** | Workflow Boss (enablement); Code Boss (safety intent) |

## User setup (like wiki)

Same pattern as [wiki setup](./wiki/setup.md): install once per machine/project, optional forever.

### In agent (recommended)

```text
/hooks-init
```

Answer: profile (`minimal` default), target (`all` / `claude` / `cursor` / `project` / `config`), project directory.

### Shell

```sh
export FRACTAL_AGENTIC_ROOT=/path/to/mandala/packages/fractal-agentic

# Preferences + env snippet (~/.config/fractal-agentic/)
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --target config --profile minimal

# Claude-compatible user settings (merge or side file)
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --target claude --profile minimal

# Cursor project hooks
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --target cursor --project-dir . --profile minimal

# Everything practical for this machine + project
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --target all --project-dir . --profile minimal
```

### After install

```sh
source ~/.config/fractal-agentic/env.sh   # or add to ~/.zshrc
# GUI hosts: set FRACTAL_AGENTIC_ROOT + FRACTAL_HOOK_PROFILE in app env
# Restart the agent host so hooks reload
```

### Check

```text
/hooks-status
```

```sh
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --check --target all --project-dir .
```

## What gets installed

| Target | Location |
|---|---|
| `config` | `~/.config/fractal-agentic/hooks.json`, `env.sh` |
| `claude` | Merge into `~/.claude/settings.json` when safe; else `~/.claude/fractal-hooks.json` + project materialization |
| `cursor` | `<project>/.cursor/hooks.json` |
| `project` | `<project>/.fractal-agentic/hooks.claude.json` (absolute paths) |

Existing non-Fractal hooks are **preserved** unless you pass `--force` on the claude target.

## Profiles

| Profile | Behavior |
|---|---|
| **minimal** (default) | Destructive bash, `--no-verify`, config-protection, SessionStart bootstrap, scheduled-essay due check |
| **standard** | + Stop quality batch + console.log warn |
| **strict** | + first-edit GateGuard (`FRACTAL_GATEGUARD=off` to disable) |

```sh
export FRACTAL_HOOK_PROFILE=minimal
export FRACTAL_DISABLED_HOOKS=pre:edit:config-protection
export FRACTAL_GATEGUARD=off
```

## Why they exist

| Need | Hook |
|---|---|
| Block force-push / reset --hard / curl\|sh | `pre:bash:safety` |
| Block `--no-verify` | `pre:bash:no-verify` |
| Stop gutting eslint/tsconfig | `pre:edit:config-protection` |
| Soft session identity | `session:start` |
| Mark scheduled essay work due | `periodic:essay-due` (due-only; never starts an agent) |
| Optional quality on Stop | `stop:quality-batch`, `stop:console-warn` |
| Optional fact-force | `pre:edit:gateguard` (strict) |

## What they must not do

- Refuse product work because pins or MCP are missing  
- Replace boss-orchestration or primary verification  
- Require install before coding  

## Review fan-out (related, also user-facing)

Multi-dimension review is a **command**, not a one-off maintainer task:

```text
/review-fanout
```

Contract: [`/review-fanout`](../commands/review-fanout.md) and `workflows/review-fanout.workflow.md`.
No native Workflow engine is required; the agent executes the playbook and uses parallel subagents when available.

## Related

- `hooks/README.md` — package detail
- [troubleshooting](./troubleshooting.md#hooks)  
- [wiki setup](./wiki/setup.md) — same “user init” pattern  
- `/hookify` — personal rules (complementary)  
