---
name: design-loop-delta
description: >
  Close the code↔design loop: re-extract a surface after design-to-code apply and
  report token/class/unresolved deltas vs a baseline contract. Use after apply,
  for round-trip verification, "re-extract", "design loop delta", or P3 of
  preprojects/code-design-loop. Pair with code-to-design and design-to-code.
---

# Design loop delta

After **design-to-code** apply, prove the loop closed: re-read monorepo tokens/styles
for the surface and **diff** against the extract baseline contract.

**Product:** `preprojects/code-design-loop/`  
**Not this:** full L3 Playwright re-freeze (optional; use `code-to-design` capture-l3).  
Default P3 path is **token + unresolved delta** (fast, deterministic).

## Hard gates

1. Package under `vendors/design-packages/<surface-id>/` with existing `evidence/contract.json`.  
2. Baseline preserved at `evidence/contract.baseline.json` (created once from first extract if missing).  
3. Surface id stable across baseline → after.  
4. Write `evidence/delta.json` + `delta-report.md` (and optional update of `contract.json` tokens).  
5. Do not invent token values — only parse source sheets.

## Pipeline

1. Load package `meta.json` + `evidence/contract.json`.  
2. If no `contract.baseline.json`, copy current contract as baseline (first delta run after apply should baseline *before* re-extract if not already snapshotted at extract time).  
3. **Re-extract tokens** from monorepo SASS listed in meta / allowlist (pilot: `sites/fractaldharma/src/lib/styles/_tokens.sass`).  
4. Build `contract.after` (version 2, same surfaceId, updated tokens + unresolved cleaned when now observed).  
5. Diff: tokens added/removed/changed; unresolved codes added/removed; orphans if present.  
6. Write reports.

Helper:

```bash
# Snapshot baseline (once, right after extract / before apply preferred)
node packages/fractal-agentic/skills/design-loop-delta/scripts/delta.mjs \
  --package vendors/design-packages/fractaldharma-home \
  --snapshot-baseline

# After apply: re-extract + delta
node packages/fractal-agentic/skills/design-loop-delta/scripts/delta.mjs \
  --package vendors/design-packages/fractaldharma-home
```

## Open Design

See `preprojects/code-design-loop/docs/OPEN-DESIGN-WORKFLOW.md` for MCP / project open steps.

## Verification

1. Delta report exists and lists expected apply (e.g. `--text-bs` confidence → observed).  
2. Surface id unchanged.  
3. Baseline file not overwritten by default.

## Output to user

1. Summary: added/changed tokens, resolved unresolved codes  
2. Paths: delta-report.md, delta.json  
3. Whether round-trip looks closed for the pilot intent  
