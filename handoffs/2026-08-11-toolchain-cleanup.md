---
task: toolchain-cleanup
status: active
host: codex-desktop
branch: main
boss: code
updated: 2026-08-11
---

# Handoff — monorepo toolchain cleanup

## Where we are

The repository now pins Node 24.19.0 in `.node-version`. `fnm` has that version as its
current/default runtime, and the user-level Corepack shim resolves `pnpm` to 11.20.0.
The invalid package-manifest edits that attempted to downgrade `jsdom` and Node engines
were restored. All 22 tracked workspace manifests parse as JSON and `git diff --check`
passes.

## Decisions

- Use Node 24.19.0: it is the installed LTS version and satisfies `jsdom@30`'s engine
  range and the package-level Node floor of 22.22.2.
- Use Corepack's pnpm 11.20.0 instead of Homebrew pnpm 11.0.4; a Corepack shim was added
  to `/Users/amrit/.local/bin`, which is earlier in the user's shell PATH.
- Preserve unrelated uncommitted work, including `sites/mandalarepo/`, its lockfile
  importer entry, and the existing `pnpm-workspace.yaml` / `fractals-styler` changes.

## Remaining

- [ ] In an interactive terminal at the repository root, run `pnpm install`. pnpm will
  ask to replace the old generated `node_modules` directory; confirm the prompt.
- [ ] If the interactive install succeeds, run the scoped checks for the workspace being
  worked on (for example, `pnpm --filter mandalarepo check`).

## Gotchas

- `pnpm install --frozen-lockfile` in this non-interactive session stopped before
  purging `node_modules`; this is expected safety behavior, not a dependency failure.
- A lockfile-only verification attempted registry supply-chain checks but this execution
  environment had no DNS access (`ENOTFOUND`), so full install verification remains for
  a networked interactive terminal.
- Do not lower `packages/morphicons-svelte`'s Node engine to bypass the error:
  `jsdom@30` independently requires Node 22.22.2+ or Node 24.15.0+.

## Key files

- `.node-version` — repository-wide Node version pin.
- `packages/morphicons-svelte/package.json` — Node engine and exact `jsdom@30.0.1`.
- `packages/fractal-svelte/package.json` — retains `jsdom@30` compatibility.
- `pnpm-lock.yaml` — includes the user-created `sites/mandalarepo` importer and was left intact.
