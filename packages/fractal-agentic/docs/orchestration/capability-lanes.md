---
title: "Capability lanes"
description: "Optional implementer and reviewer pins improve lane selection when the host exposes them; missing pins never block delivery."
type: guide
---

# Capability lanes

Capability lanes are optional host-recognized roles. They improve delegation and independent review when available, but the primary session can always complete the work.

## The three lanes

| Lane | `agent_type` | Typical pin |
|---|---|---|
| Routine implementer | `fractal_agentic_routine_implementer` | gpt-5.6-luna / max |
| Complex implementer | `fractal_agentic_complex_implementer` | gpt-5.6-terra / high |
| Fresh reviewer | `fractal_agentic_fresh_reviewer` | gpt-5.6-sol / high / read-only |

Templates: `plugin/agents/fractal-agentic-*.toml`  
Install: `sh scripts/install-agents.sh` → host agents dir (e.g. `$CODEX_HOME/agents` or equivalent)

## Check the right layer

| Layer | Question | On failure |
|---|---|---|
| **A Content** | Can we read the plugin? | Project AGENTS only |
| **B Install** | TOML files on disk? | Warn; keep coding |
| **C Session** | Does *this* task list those `agent_type`s? | Degrade; `pins: unverified` |

**B ≠ C.** Install success does not mean types are exposed mid-session.

## `capability_mode`

Set once per non-trivial task:

| Mode | Meaning |
|---|---|
| `plugin_missing` | Plugin not found |
| `degraded` | Plugin OK; no pin types in session |
| `pinned_partial` | Some pin types exposed — use those |
| `pinned` | All three exposed |

Algorithm: [capability-mode.md](../../skills/boss-orchestration/references/capability-mode.md)  
Policy: [progression.md](../progression.md)

## Degrade path (first-class)

1. Implement in primary / general / domain agents  
2. Keep five-part contract for non-trivial work  
3. Verify in primary  
4. Review: domain specialist → general read-only → structured self-review  
5. Report `capability_mode` + `pins: unverified|partial`

**Never** refuse work or demand a fresh task before coding.

## When to use routine vs complex

| Routine | Complex |
|---|---|
| Spec largely determines the result | Judgment, concurrency, security-sensitive |
| Boilerplate, wiring, bounded fixes | Broad refactor, hard debug, wide blast radius |

Route by **task shape**, not prestige.
