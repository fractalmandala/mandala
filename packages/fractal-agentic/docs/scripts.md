---
title: "Scripts reference"
description: "Run from plugin root ($FRACTAL_AGENTIC_ROOT) unless noted."
type: guide
---

# Scripts reference

Run from plugin root (`$FRACTAL_AGENTIC_ROOT`) unless noted.

| Script | Purpose |
|---|---|
| `bin/cli.js` (`npx fractal-agentic`) | Universal Node CLI installer across Antigravity, Claude Code, and Codex |
| `scripts/resolve-plugin-root.sh` | Print a complete plugin root (router, seven boss playbooks, runtime) or exit 1 |
| `scripts/install-agents.sh` | Install/check optional capability TOML pins into the host agents directory |
| `scripts/install-hooks.sh` | User-facing install/check for optional hooks (`--target config\|claude\|cursor\|project\|all`) |
| `scripts/install-improve.sh` | User-facing enable/check for self-improvement plane (`--profile off\|observe\|full`) |
| `scripts/install-agents.sh --check` | Disk exactness only (layer B) |
| `scripts/inspect-agent-runtime.sh` | Allowlisted pin observation for a thread id |
| `scripts/check-armory.sh` | Core files + critical skills health |
| `scripts/check-nonblocking-policy.sh` | Fail if hard-gate preflight language returns |
| `scripts/check-progressive-discovery.sh` | Enforce router size, nested boss structure, link integrity, and stale-reference removal |
| `scripts/verify.sh` | Full package verification suite |
| `skills/llm-wiki/scripts/wiki-resolve-root.sh` | Print wiki vault root or exit 1 |
| `skills/llm-wiki/scripts/wiki-init.sh` | Scaffold vault directories + optional user config |

## Examples

```sh
export FRACTAL_AGENTIC_ROOT=/path/to/plugin

sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-agents.sh"
sh "$FRACTAL_AGENTIC_ROOT/scripts/verify.sh"

sh "$FRACTAL_AGENTIC_ROOT/skills/llm-wiki/scripts/wiki-init.sh" ~/Documents/fractal-wiki
export FRACTAL_WIKI_ROOT=~/Documents/fractal-wiki
sh "$FRACTAL_AGENTIC_ROOT/skills/llm-wiki/scripts/wiki-resolve-root.sh"
```
