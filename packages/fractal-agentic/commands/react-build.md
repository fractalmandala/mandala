---
description: Fix frontend build failures (Vite, SvelteKit, svelte-check, TypeScript) incrementally — component compile errors, SSR/hydration mismatches, module resolution and missing types. Invokes the build-error-resolver agent for minimal, surgical fixes.
---

# Frontend Build and Fix

This command invokes the **build-error-resolver** agent to incrementally fix frontend build errors with minimal changes.

## What This Command Does

1. **Detect Build System**: Identify Vite, SvelteKit (`svelte.config.js`), or plain TypeScript
2. **Run Build**: Execute the project's build script
3. **Parse Errors**: Group by layer (TypeScript / svelte-check / bundler config / SSR-hydration)
4. **Fix Incrementally**: One error at a time, re-running build after each change
5. **Report Summary**: Show what was fixed and what remains

## When to Use

Use `/react-build` when:

- `pnpm build` (or npm/yarn equivalent) fails
- Component compile errors after a TypeScript or Svelte upgrade
- SSR/hydration mismatch errors at runtime
- Server/client module boundary errors (`$lib/server` imports leaking client-side)
- After installing or upgrading `svelte`, `@sveltejs/kit`, or a bundler plugin
- Missing types or "module not found" errors in frontend packages

Prefer `/svelte-build` when the target is a known Svelte/SvelteKit package and you want the stack-specific diagnostics flow.

## Scope

This command owns **frontend build/bundler/SSR-hydration** failures across any component framework. For pure TypeScript type errors with no UI involvement, use a generic build fixer instead.

## Diagnostic Commands Run

```bash
# Project build script (preferred)
pnpm build
npm run build --if-present

# Standalone checks
pnpm check            # svelte-check for SvelteKit projects
npm run typecheck --if-present
tsc --noEmit -p tsconfig.json

# Bundler-specific fallback
vite build            # Vite
```

## Example Session

````text
User: /react-build

Agent:
# Frontend Build Resolution

## Build System Detected
SvelteKit (svelte.config.js + @sveltejs/adapter-static)

## Initial Diagnostics

```bash
$ pnpm build
src/lib/components/EntryCard.svelte:3:2 - error: `items` is declared but never used
src/routes/+page.ts:5:10 - error: Cannot find module '$lib/server/db'
src/routes/+layout.svelte:18:4 - error: Hydration mismatch: server/client markup differs
```

Errors found: 3

## Fix 1: Unused declaration

File: src/lib/components/EntryCard.svelte:3
Cause: Leftover prop after refactor.

```svelte
- let { items }: Props = $props();
+ let { entry }: Props = $props();
```

## Fix 2: Server-only module imported client-side

File: src/routes/+page.ts:5
Cause: `$lib/server/db` must not be imported outside server files; move the query into `+page.server.ts`.

## Fix 3: Hydration mismatch

File: src/routes/+layout.svelte:18
Cause: `new Date().toLocaleTimeString()` rendered during SSR differs at hydrate; gate behind `browser` or `$effect`.

## Final Verification

```bash
$ pnpm build
✓ built in 4.1s
$ pnpm test
✓ 47 tests passed
```

Build Status: PASS: SUCCESS
````

## Common Errors Fixed

| Error | Typical Fix |
|---|---|
| `Cannot find module '$lib/...'` | Fix alias paths / `files` config; install missing dep |
| Server-only import in client code | Move logic to `+page.server.ts` / `hooks.server.ts` / `$lib/server` |
| Hydration mismatch | Gate browser-only values (`Date.now`, `window.*`) behind `browser` or `$effect` |
| `Unexpected token '<'` in a component file | Missing/removed compiler plugin in the Vite config |
| Missing type declarations | Install the package's types or add a minimal `declare module` |
| Duplicate framework copies | Dedupe via `pnpm dedupe` / `overrides` |

## Fix Strategy

1. **Compile errors first** — code must build
2. **Hydration errors second** — affects production correctness
3. **Bundler config third** — restore plugin/alias correctness
4. **One fix at a time** — verify each change
5. **Minimal changes** — never `// @ts-ignore` without explanation
6. **Re-run after each fix** — surface new errors immediately

## Stop Conditions

The agent will stop and report if:

- Same error persists after 3 attempts
- Fix introduces more errors than it resolves
- Requires architectural change beyond build resolution
- Bundler version no longer supports the installed framework major

## Related Commands

- `/svelte-build` — Svelte-specific build and svelte-check flow
- `/svelte-test` — run tests after the build is green
- `/code-review` — review code quality after the build succeeds
- `verification-loop` skill — full verification loop

## Related

- Agent: `agents/build-error-resolver.md`
- Skills: `skills/frontend-patterns/`, `skills/vite-patterns/`
