---
description: Complete Svelte verification cycle — review, build, test, quality-gate — in one shot. Stops at first failure.
---

# /sv

Single-command Svelte verification pipeline. Runs the full check cycle
for the current project. Stops at the first failure so you fix it and re-run.

## Usage

```
/sv
/sv apps/fracta
/sv --skip-test
```

## Pipeline

1. **Review** — run /svelte-review on changed files. If issues found, report severity
   and stop. Fix before continuing.
2. **Build** — run /svelte-build (svelte-check + vite build). Zero errors required.
3. **Test** — run /svelte-test (vitest + playwright). If --skip-test, skip.
4. **Quality gate** — run /quality-gate on changed files. Format violations fixed.

## Exit rules

- Any step fails → stop immediately, report what failed, let user fix
- All four pass → print summary: files checked, errors fixed, tests passed
- Never commit or push — this is verify-only, not ship

## Arguments
- <path> optional — target project or file
- --skip-test optional — skip vitest/playwright step
- --review-only optional — run only /svelte-review
