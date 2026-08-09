---
title: "Fractal Agentic — progression & non-blocking policy"
description: "Audience: agent policy (humans should read it too). Ships inside plugin/docs/ so every install has it."
type: guide
---

# Fractal Agentic — progression & non-blocking policy

**Audience: agent policy** (humans should read it too). Ships inside `plugin/docs/` so every install has it.

**One-line principle:** *Harness upgrades quality; it never owns permission to ship product work.*

This document is the **canonical policy** for soft failure. Runtime docs
(`boss-orchestration`, `role-contracts`, `/orchestrate`, AGENTS snippet) must not
contradict it. Prefer linking here over re-stating hard gates.

---

## Three layers (never conflate)

| Layer | Question | Tool / signal | On failure |
|---|---|---|---|
| **A — Content** | Can we read the startup router, nested boss playbooks, and `boss-orchestration`? | `resolve-plugin-root.sh`, filesystem | Soft: project AGENTS only; **still do the work** |
| **B — Install** | Are capability TOML files on disk under `$CODEX_HOME/agents` (or `~/.codex/agents`)? | `install-agents.sh` / `--check` | Soft: warn once + installer path; **still do the work** |
| **C — Session** | Does *this* task’s spawn tool list `fractal_agentic_*` types? | Host spawn `agent_type` catalog only | Soft: fall back; mark `pins: unverified`; **still do the work** |

### Critical distinction

| Fact | Implication |
|---|---|
| `install-agents.sh` writes **disk** (layer B) | Success ≠ types available in the current task |
| Codex often loads custom agents at **task/process start** | New files may need a **new task** for layer C |
| Layer B pass + layer C fail is **normal** mid-session | Never treat as install failure or refuse coding |
| Models cannot force host rescan | “Fresh task” is optional host UX, not a skill law |

**Never infer layer C from layer B.** Only the session’s spawn catalog proves exposure.

---

## Session `capability_mode`

Set **once** early in a non-trivial task (after detection). Do not re-litigate every
tool call.

| Mode | When | Behavior |
|---|---|---|
| `plugin_missing` | Layer A failed | Project AGENTS only; no Fractal process claims |
| `fallback` | Layer A OK; B and/or C incomplete | Selected boss playbook + contracts; primary/general/domain agents; `pins: unverified` |
| `pinned` | Layer A OK and at least one pin type listed in **this** session’s spawn catalog | Prefer those types; use whichever of the three exist (not “all or nothing”) |
| `pinned_partial` | Some pin types exposed, not all | Use available pins; fall back only the missing roles |

Report in delivery notes:

```text
capability_mode: fallback | pinned | pinned_partial | plugin_missing
pins: verified | unverified | n/a
layers: content=ok|miss install=ok|miss|skip session=ok|miss|skip
```

Full algorithm: [skills/boss-orchestration/references/capability-mode.md](../skills/boss-orchestration/references/capability-mode.md).

---

## Default path = fall back, not refuse

```text
prefer(session-exposed pin for this role)
  → else prefer(domain specialist agent)
  → else prefer(general-purpose subagent)
  → else primary implements / self-reviews
state once when not fully pinned: "pins: unverified"
never: stop / freeze / demand install or fresh task before product work
```

Hard stops are reserved for **real safety** (user-forbidden destructive ops, secrets
exfiltration, etc.) — not missing Luna/Sol/Terra pins.

---

## Evidence of capability, not ritual of install

| Bad (ritual) | Good (evidence) |
|---|---|
| `--check` must pass before coding | If spawn lists type → use it |
| All three types required or stop | Use any of the three that exist |
| Fresh task mandatory after install | Optional tip; work continues now |
| “Never substitute” | Fall back openly; never **claim** a pin was used when it wasn’t |

Optional install tip (once, non-blocking):

```sh
sh <plugin>/scripts/install-agents.sh
# Disk only. Start a *new* Codex task later if you want spawn types re-discovered.
```

---

## Failure-mode matrix (expected behavior)

| # | Scenario | Expected |
|---|---|---|
| 1 | Plugin not found | Continue under project AGENTS; no fake path |
| 2 | Plugin found, agents never installed | Continue in fallback mode; one install tip |
| 3 | Just installed in **same** task | Continue in fallback mode (or pinned if host hot-reloads); do not refuse |
| 4 | Installed + **new** task + types listed | Prefer pins (`capability_mode: pinned` or `pinned_partial`) |
| 5 | Only reviewer pin present | Implement in fallback mode; review with pin if useful |
| 6 | User: “just fix the UI” | Never blocked by preflight |
| 7 | `--check` fails (missing/stale/conflict) | Warn; continue in fallback mode |
| 8 | Model cannot observe sandbox | Note residual risk; do not block ship on that alone |

If any scenario requires “open a new task **before** writing code,” the design has failed.

---

## Single policy owner

| Authority | Document |
|---|---|
| **Policy** | This file |
| **Runtime kernel** | [`skills/boss-orchestration/SKILL.md`](../skills/boss-orchestration/SKILL.md) |
| **Spawn contracts** | [`skills/boss-orchestration/references/role-contracts.md`](../skills/boss-orchestration/references/role-contracts.md) |
| **Mode algorithm** | [`skills/boss-orchestration/references/capability-mode.md`](../skills/boss-orchestration/references/capability-mode.md) |
| **Slash entry** | [`commands/orchestrate.md`](../commands/orchestrate.md) |
| **Project mandate** | [`project-integration/AGENTS-SNIPPET.md`](../project-integration/AGENTS-SNIPPET.md) |
| **Startup router** | [`AGENTS.md`](../AGENTS.md) |
| **Boss playbooks** | [`docs/bosses/INDEX.md`](./bosses/INDEX.md) |

Other docs **link** here. Do not invent a second hard-stop preflight in a boss playbook
or skill.

---

## Regression guard

```sh
# from plugin root
sh scripts/check-nonblocking-policy.sh
```

Also run as part of `scripts/verify.sh` and `scripts/check-armory.sh`.

Fails if orchestration core files reintroduce hard-gate phrases (e.g. “stop the lane”,
“Require spawn types”, “Exit zero is required” as a work gate).

---

## Continuous LLM wiki

Local vault (`FRACTAL_WIKI_ROOT` / `/wiki-init`) is optional. Capture after orchestrate
is soft. Missing vault or write errors **never** fail delivery. See
[skills/llm-wiki/SKILL.md](../skills/llm-wiki/SKILL.md).

## Checklist for authors

| Do | Don’t |
|---|---|
| Prefer pins when listed in **this** session | Infer pins from `~/.codex/agents` alone |
| One non-blocking rule in boss-orchestration | Duplicate hard stops across 4 files |
| Fall back + `pins: unverified` | “Forbidden to substitute” / refuse Sol or general agents |
| Installer: disk vs session messaging | Imply install = immediately spawnable |
| Test fallback path as first-class | Only test full pin path |
| Lint via `check-nonblocking-policy.sh` | Rely on memory |

---

## Installer / host notes

- Plugin marketplace/git install → layer **A** only.
- `install-agents.sh` → layer **B** only.
- New Codex task (host-dependent) → may refresh layer **C**.
- Primary + domain agents are the **always-available** delivery path; pins are an
  optimization when exposed.
