---
title: "Troubleshooting"
description: "Operator runbook for Fractal Agentic. Root pointer: ../TROUBLESHOOTING.md."
type: guide
---

# Troubleshooting

Operator runbook for Fractal Agentic. Root pointer: [`../TROUBLESHOOTING.md`](../TROUBLESHOOTING.md).

**Doctrine:** missing pins, hooks, marketplace, or wiki **never** freeze product work. Fall back and continue — [progression.md](./progression.md).

## Quick health

```sh
export FRACTAL_AGENTIC_ROOT=/absolute/path/to/mandala/packages/fractal-agentic
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
sh "$FRACTAL_AGENTIC_ROOT/scripts/check-armory.sh"
sh "$FRACTAL_AGENTIC_ROOT/scripts/check-nonblocking-policy.sh"
```

---

## Detection / root resolution

| Symptom | Fix |
|---|---|
| “Fractal Agentic not found” | Set `FRACTAL_AGENTIC_ROOT` to the plugin directory containing `plugin.json`, the `AGENTS.md` router, `docs/bosses/`, and `skills/boss-orchestration` |
| Env points at monorepo root | Use `…/packages/fractal-agentic` (or let the resolver find that package) |
| Missing boss playbook | Refresh the plugin install; the resolver now rejects incomplete progressive-discovery trees |
| Wrong files / old armory | Confirm resolve prints the install you expect (cache vs git checkout) |

```sh
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
```

---

## Multi-host install

| Symptom | Fix |
|---|---|
| Marketplace manifest missing (Codex) | Include the root `.agents/plugins` directory in the sparse checkout |
| Plugin missing after upgrade | Host upgrade/refresh + **new session/task** if plugins are cached |
| Claude-compatible host sees no commands | Load the **package** directory (`.claude-plugin/plugin.json` lives here) |
| Cursor ignores process | Paste project [AGENTS snippet](../project-integration/AGENTS-SNIPPET.md); set `FRACTAL_AGENTIC_ROOT` |
| Gemini/Kimi no skills | Point skill path at `plugin/skills` or open plugin root as project |
| Hooks do nothing | Host must register hooks; set `FRACTAL_AGENTIC_ROOT`; see [hooks/README.md](../hooks/README.md) |

Catalog vs package layout: [02-install.md](./02-install.md).

### Codex-specific paths

| Symptom | Fix |
|---|---|
| `marketplace root does not contain a supported manifest` | Use `fractalmandala/mandala --sparse .agents/plugins`; the root catalog loads the package through `git-subdir` |
| Commands missing after push | `codex plugin marketplace upgrade mandala` + new task |
| `find … wiki-init.md` empty | Search with `-path '*fractal-agentic*'` (trailing `*`). Cache often under `~/.codex/plugins/cache/…` |

---

## Pins / orchestration

| Symptom | Fix |
|---|---|
| Install passed, types “not exposed” | Disk (layer B) OK; session (C) needs new task — **keep coding** fallback |
| Agent refuses work without pins | Wrong behavior — upgrade plugin docs; non-blocking policy forbids freezes |
| `--check` fails conflict | Manual merge; installer never overwrites differing files |
| Unsure of capability_mode | See [capability-mode.md](../skills/boss-orchestration/references/capability-mode.md) |

```sh
sh scripts/install-agents.sh --check
```

---

## Self-improvement plane

| Symptom | Fix |
|---|---|
| `/improve-status` fails check | Run `/improve-init` or `sh scripts/install-improve.sh --profile observe` |
| Want learning off | `sh scripts/install-improve.sh --profile off` |
| No evals after ship | Profile must be `full`; self-eval is soft and never blocks ship |
| Data location | Default `${XDG_DATA_HOME:-~/.local/share}/fractal-agentic` — see config `data_root` |

Design: [self-improvement.md](./self-improvement.md).

## Hooks

| Symptom | Fix |
|---|---|
| Every edit blocked (strict GateGuard) | `export FRACTAL_GATEGUARD=off` or lower profile to `minimal`/`standard` |
| Config edits blocked | Intentional for lint/tsconfig; disable `pre:edit:config-protection` via `FRACTAL_DISABLED_HOOKS` only if user asked to change config |
| Force-push blocked | Intentional; get explicit user approval and disable safety hook only if required |
| SessionStart too noisy | `FRACTAL_SESSION_START_CONTEXT=off` or lower `FRACTAL_SESSION_START_MAX_CHARS` |
| Hooks slow Stop | Use `minimal` profile; `stop:quality-batch` is standard+ only |

Profiles and IDs: [hooks/README.md](../hooks/README.md).

---

## Wiki

| Symptom | Fix |
|---|---|
| Wiki commands no-op | `/wiki-init` or set `FRACTAL_WIKI_ROOT` / config file |
| Different tools different vaults | Don’t re-init; share one `wiki_root` |
| GUI app can’t see env | Set env in app UI or use config file only |
| Capture skipped after orchestrate | Expected if vault unset or `capture.orchestrate: false` |

```sh
sh "$FRACTAL_AGENTIC_ROOT/skills/llm-wiki/scripts/wiki-resolve-root.sh"
```

---

## Skills / agents not triggering

| Symptom | Fix |
|---|---|
| Skill never loads | Host skill discovery must include `plugin/skills`; check frontmatter `description` |
| Wrong boss | Re-read the [startup router](../AGENTS.md) and [boss hub](./bosses/INDEX.md); Creator can commandeer mid-build |
| Subagent type unknown | Only use types listed in **this session’s** spawn catalog; fall back otherwise |

---

## Health scripts

```sh
sh scripts/check-armory.sh
sh scripts/check-nonblocking-policy.sh
sh scripts/verify.sh
```

---

## Getting help

1. [SOUL.md](../SOUL.md) — principles  
2. [AGENTS.md](../AGENTS.md) — startup router and one-boss selection
3. [progression.md](./progression.md) — pin layers  
4. [CUSTOMIZE.md](../CUSTOMIZE.md) — fork / extend  
