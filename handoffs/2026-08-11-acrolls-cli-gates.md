---
task: acrolls-cli-success-criteria
status: complete
host: codex
updated: 2026-08-11T18:39:00+05:30
---

# Team board — Acrolls CLI success criteria

## Merge gate

All five user-facing criteria must have command output or direct artifact evidence. A warning is
recorded separately from a failure. No source edits are authorized during this verification pass.

## Cards

| ID | Owner | State | Scope | Acceptance |
|---|---|---|---|---|
| CLI-001 | acrolls_fix_review | review | Monorepo install/build | PASS — `pnpm install && pnpm build` exited 0; CLI tests 9/9 passed. Warning: ignored esbuild build scripts. |
| CLI-002 | docs_workflow_review + integrator | merged | Example host + foundation CSS | PASS — added `/acceptance`; production preview contains code frame, table wrapper, callout, and figure; foundation-only build also passes. |
| CLI-003 | mandala_acrolls_review + integrator | review | CLI validate + studio | PASS in the restored integrator workspace — validate: `1 discovered · 1 ready · 0 normalized · 0 rejected`; Studio bound on `127.0.0.1:4329` and served HTML, then was stopped. |

## Gate ledger

1. `pnpm install && pnpm build` — **PASS**. All package builds completed; warnings are non-fatal.
2. `examples/kit-consumer` production build and `/acceptance` route — **PASS**. The route now
   renders code, table, callout, and figure together; the preview response contains all four
   expected markers.
3. `acrolls validate` on `examples/starter/article.md` — **PASS**.
4. `acrolls studio` on `examples/starter/article.md` — **PASS**. Local HTTP probe returned the
   Studio HTML; the process was terminated after verification.
5. Foundation-only CSS — **PASS for build compatibility**. A temporary swap to
   `@acrolls/styles/foundation.css` built the example successfully and was restored with no
   remaining diff. A browser-level foundation-only route test is still optional follow-up.

## Merge decision

**pass** for the five-criterion bundle. Remaining build warnings are non-fatal and pre-existing
or unrelated to the acceptance fixture.

## Integrator

`/root` owns the final pass/fail ledger, reruns any failed gate, and updates this handoff with
commands, outputs, blockers, and next actions.
