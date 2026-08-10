# Fractal Agentic hooks (optional)

Event-driven automations for hosts that support PreToolUse / Stop / SessionStart-style hooks.  
**Not required** for `/orchestrate`, bosses, or pins. Default posture: **minimal safety**, never freeze product work.

## Design principles

1. **Optional** — install only when the host supports hooks and you want them.
2. **Profiles** — `minimal` (default) | `standard` | `strict` via `FRACTAL_HOOK_PROFILE`.
3. **Non-blocking doctrine** — hooks must not refuse implementation because pins/MCP/formatters are missing.
4. **Block only irreversible harm** — secrets exfil patterns, force-push, reset --hard, config sabotage, git hook bypass.
5. **Host-portable scripts** — Node scripts under `scripts/` resolve `FRACTAL_AGENTIC_ROOT` / plugin root; host JSON only maps events.

## Profiles

| Profile | What runs |
|---|---|
| **minimal** (default) | Pre-bash safety, config-protection, no-verify block, bounded SessionStart bootstrap, scheduled-essay due check |
| **standard** | + Stop quality batch (format/typecheck when tools exist, warn-only), console.log warn |
| **strict** | + GateGuard-style first-edit fact force (opt-out with `FRACTAL_GATEGUARD=off`) |

```sh
export FRACTAL_HOOK_PROFILE=minimal   # or standard | strict
export FRACTAL_DISABLED_HOOKS=pre:bash:safety,stop:quality-batch   # comma-separated ids
export FRACTAL_GATEGUARD=off          # disable fact-force even in strict
export FRACTAL_SESSION_START_MAX_CHARS=4000
export FRACTAL_SESSION_START_CONTEXT=off
```

## Files

```text
hooks/
  README.md
  profiles.json
  hooks.claude.json      # Claude-compatible settings fragment
  hooks.cursor.json      # Cursor-compatible mapping
  scripts/
    lib.js               # shared: stdin, root resolve, profile, I/O
    pre-bash-safety.js
    pre-config-protection.js
    pre-no-verify.js
    session-start.js
    periodic-essay-due.js  # due check only; never starts an agent
    stop-quality-batch.js
    stop-console-warn.js
    pre-gateguard.js
```

## Install (user-facing — like wiki)

Users set this up **on their machine** after plugin install. Maintainers do not pre-register hooks for everyone.

### Recommended (agent)

```text
/hooks-init
```

### Shell

```sh
export FRACTAL_AGENTIC_ROOT=/absolute/path/to/mandala/packages/fractal-agentic

# Preferences only
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --target config --profile minimal

# Machine + current project (config + claude + cursor + project materialization)
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --target all --project-dir . --profile minimal
```

### Status

```text
/hooks-status
```

```sh
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --check --target all --project-dir .
```

### What install writes

| Target | Location |
|---|---|
| `config` | `~/.config/fractal-agentic/hooks.json` + `env.sh` |
| `claude` | Merge into `~/.claude/settings.json` when safe; else side file `fractal-hooks.json` |
| `cursor` | `<project>/.cursor/hooks.json` |
| `project` | `<project>/.fractal-agentic/hooks.claude.json` (absolute paths) |

Then: `source ~/.config/fractal-agentic/env.sh`, set the same env in GUI hosts, **restart** the agent.

### Opt out entirely

Skip `/hooks-init`. Skills (`safety-guard`, `hookify`, `gateguard`) still document the same behaviors for manual use.

## Hook IDs

| ID | Event | Profile | Blocking |
|---|---|---|---|
| `pre:bash:safety` | Pre Bash | minimal+ | yes (destructive / secrets patterns) |
| `pre:bash:no-verify` | Pre Bash | minimal+ | yes (`--no-verify` / hook skip) |
| `pre:edit:config-protection` | Pre Edit/Write | minimal+ | yes (linter/formatter config edits) |
| `session:start` | SessionStart | minimal+ | no |
| `periodic:essay-due` | SessionStart / Stop | minimal+ | no (marks pending work only) |
| `stop:quality-batch` | Stop | standard+ | no (warn / best-effort) |
| `stop:console-warn` | Stop | standard+ | no |
| `pre:edit:gateguard` | Pre Edit/Write | strict | first deny per file (soft allow after facts) |

## Relation to skills

| Skill / command | Role |
|---|---|
| `hookify` | User-authored project rules |
| `gateguard` | Methodology for fact-force (strict hook implements a light form) |
| `safety-guard` | Skill guidance when hooks are absent |
| `boss-orchestration` | Delivery — hooks never replace this |

## Workflow Boss

Personal automation and hook enablement live in the
[Workflow Boss playbook](../docs/bosses/workflow/INDEX.md). Use `AGENTS.md` only to
select that boss, and keep delivery under `/orchestrate`.
