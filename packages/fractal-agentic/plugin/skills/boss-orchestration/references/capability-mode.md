# Session capability mode

Set **once** after Fractal Agentic detection on a non-trivial task. Reuse for the rest of
the session unless the workspace root changes.

Canonical policy: [docs/DEGRADATION.md](../../../docs/DEGRADATION.md).

## Algorithm

```text
1. Layer A — Content
   resolve plugin root (env / search / resolve-plugin-root.sh)
   can_read AGENTS.md + docs/bosses/INDEX.md + selected boss INDEX.md
            + skills/boss-orchestration/SKILL.md?
   if no → capability_mode = plugin_missing; stop algorithm; proceed with project AGENTS only

2. Layer B — Install (optional probe, never blocking)
   optionally: sh <plugin>/scripts/install-agents.sh --check
   install_ok = exit 0
   (if not run: install_ok = skip)

3. Layer C — Session (only evidence of pin usability)
   inspect host spawn tool agent_type list for this task (do not invent types)
   exposed = intersection of list with:
     - fractal_agentic_routine_implementer
     - fractal_agentic_complex_implementer
     - fractal_agentic_fresh_reviewer
   NEVER set exposed from filesystem alone (install_ok does not imply exposed)

4. Mode
   if plugin_missing → done
   if |exposed| == 3 → capability_mode = pinned
   if |exposed| in 1..2 → capability_mode = pinned_partial
   else → capability_mode = degraded

5. State once if mode != pinned:
   "Fractal Agentic capability_mode=<mode>; pins unverified or partial — continuing work."
```

## Role selection by mode

| Need | `pinned` / `pinned_partial` | `degraded` | `plugin_missing` |
|---|---|---|---|
| Routine implement | pin if exposed else degrade for that role | primary / general | project default |
| Complex implement | pin if exposed else degrade | primary / strongest available | project default |
| Final review | pin if exposed else domain / general / self-review | domain → general → self-review packet | project review norms |
| Commit consult | same as review | same | optional |

**Partial pins:** use each exposed type for its role only. Missing roles use the
degraded column. Never require all three.

## Reporting

Include on non-trivial completion (or when mode ≠ `pinned`):

```text
capability_mode: <mode>
pins: verified | partial | unverified | n/a
layers: content=ok|miss install=ok|miss|skip session=ok|partial|miss|skip
```

- `pins: verified` — full `pinned` mode and review used a pin or equivalent stated path  
- `pins: partial` — `pinned_partial`  
- `pins: unverified` — `degraded` (or pins not used)  
- `pins: n/a` — `plugin_missing`

## Forbidden

- Refusing implementation because `install_ok` is false  
- Refusing implementation because `exposed` is empty  
- Demanding a fresh agent session/task before writing code  
- Claiming `agent_type: fractal_agentic_*` when that type was not in the session catalog  
- Re-running full preflight drama on every micro-edit after mode is set  
