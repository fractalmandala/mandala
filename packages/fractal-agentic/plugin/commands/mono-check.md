---
description: Run typecheck + lint across all monorepo apps, sites, and packages. Reports failures only, grouped by project.
---

# /mono-check

Cross-project monorepo health check. Runs typecheck (or build --check) on every
project that has a typecheck script. Reports failures only. Skips projects
without typecheck defined.

## Usage

```
/mono-check
/mono-check --lint
/mono-check --target apps/fracta
```

## Targets

By default scans: apps/*, sites/*, packages/*

## Pipeline

1. Discover projects with `pnpm -r exec -- pwd` to list workspace members
2. For each: if package.json has scripts.typecheck, run `pnpm --filter <pkg> typecheck`
3. Collect results: pass/fail + stderr snipped to last 5 lines
4. If --lint: also run `pnpm --filter <pkg> lint` (if script exists)
5. Report table:

```
MONO CHECK — 20 projects
========================
PASS  apps/fracta (typecheck)
PASS  apps/fractalengine (typecheck)
FAIL  packages/fractalsvelte (typecheck) — "Property 'data' does not exist..."
SKIP  sites/fractaldesign (no typecheck script)
PASS  apps/shradhapp (typecheck + lint)
========================
3/20 failed (2 typecheck, 1 lint)
```

## Exit rules

- Failures reported but never block — report-only
- All pass → "Clean monorepo"
- --target flag limits to one project

## Arguments
- --lint optional — also run lint scripts
- --target <path> optional — single project only
