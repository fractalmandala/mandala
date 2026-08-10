# Learnings and Troubleshooting

A list of common errors to avoid, and things to mind.

## 2026-08 — Vercel deployment failures across monorepo sites

Four SvelteKit sites in this pnpm monorepo deploy to Vercel as separate projects
(each with its own Root Directory). fractalmandala deployed cleanly; fractalagentic,
fractaldesign, and fractaldharma each failed for a *different* reason. Debugging them
together was misleading because the dashboard showed four identical "Error" states.
Treat every failing site as an independent diagnosis.

### Lesson 1 — SvelteKit config has exactly one home

Passing **any** option to `sveltekit({...})` in `vite.config.ts` makes SvelteKit
silently ignore the entire `svelte.config.js`. This bit fractalagentic:
`compilerOptions`/`preprocess` lived in vite.config.ts, so the adapter and
`prerender.handleHttpError: warn-on-404` in svelte.config.js were dead config,
and prerender 404s failed the build.

The giveaway line in the build log:

```
svelte.config.js is ignored when options are passed via your Vite config
```

**Rule for this repo:** `vite.config.ts` calls bare `sveltekit()` with zero arguments.
All SvelteKit config (adapter, preprocess, extensions, compilerOptions, prerender,
paths) lives in `svelte.config.js`. fractalmandala worked precisely because it
already followed this.

### Lesson 2 — Workspace packages with built outputs need a `prepare` script

fractaldesign depended on styler via `link:../../packages/fractals-styler`, and the
package's `exports` point at `dist/` — build output that is never committed. Local
machines had `dist/` from a previous manual build; Vercel's fresh checkout never did:

```
Failed to resolve entry for package "fractals-styler".
```

**Rule:** every workspace package whose `exports`/`main` point at build output must
declare a build in `prepare` (pnpm runs workspace `prepare` during install):

```json
"scripts": { "prepare": "tsup" }
```

Consumers should use `workspace:*`, not `link:`. Verified by deleting `dist/` and
re-running `pnpm install` from the root — the package rebuilt itself.

Note: sites that pin registry semver ranges (e.g. `"fractals-styler": "^2.2.0"`)
install the **published tarball**, not the workspace package — immune to the
missing-dist problem, but also frozen at whatever was last published.

### Lesson 3 — Root `.gitignore` lines hide directories from Vercel's checkout

`sites/fractaldharma` was ignored during a refactor, so its Vercel Root Directory
never existed in the checkout. Symptom: deployments erroring in ~7 seconds, before
any build step runs. If a project fails instantly, check that its Root Directory is
tracked in git first.

### Diagnostic playbook

- Pull raw build logs instead of trusting the dashboard summary:
  Vercel REST `GET /v3/deployments/{id}/events` returns a bare JSON list
  (token from `~/Library/Application Support/com.vercel.cli/auth.json`,
  pass the team id).
- Diff the failing site against a **healthy sibling** (here: fractalmandala).
  Comparing `vite.config.ts`, `svelte.config.js`, and the dependency protocol in
  `package.json` surfaced all three root causes.
- Reproduce Vercel conditions locally: fresh state (no stale `dist/`, no
  `node_modules` assumptions) before running `pnpm install && pnpm build`.

### New-site checklist for this monorepo

1. Bare `sveltekit()` in `vite.config.ts`; all config in `svelte.config.js`.
2. If linking a workspace package with built outputs, confirm it has `prepare`.
3. Site directory must not be gitignored.
4. `pnpm-lock.yaml` committed and in sync with the root `pnpm-workspace.yaml`.
5. Postbuild scripts must not hardcode output dirs — detect
   `.vercel/output/static` vs `build` (adapter-vercel vs adapter-static).
