---
task: acrolls-onboarding
status: active
host: codex
branch: main
boss: code
updated: 2026-08-11T18:20:00+05:30
---

# Handoff — Acrolls guided host onboarding

## Where we are

Acrolls now includes a terminal-first onboarding wizard at `acrolls onboard`. It detects an
existing SvelteKit host and prints an ordered, read-only walkthrough from package installation to
deployed `/docs` verification. Every checkpoint includes the exact file path, code or command,
caution, and verification check. `--check` rescans filesystem checkpoints, while `--json` emits a
versioned plan for a future modal or UI client. The CLI reference now documents the command
matrix, flags, dev/CI gates, deployment boundary, and error/exit-code surfaces. `llms.txt` points
agents to the same JSON handoff. `pnpm build`, `pnpm test`, `pnpm check`, and `pnpm build:example`
all pass. The implementation and original docs are committed as `748c8e1` on `main` and pushed
to `https://github.com/fractalmandala/Acrolls.git`. A follow-up docs pass now makes the CLI-led
drop-in the recommended first path across the handbook, README, checklist, local-install guide,
CLI reference, and `llms.txt`; those documentation files are currently uncommitted. Root
`baseHref: '/'` routing is now fixed in `@acrolls/docs/content`, with natural `/foo` and
`/foo/foo` links and regression coverage. The CLI now preserves `--base-href /` and emits clean
root route paths. The CLI-generated source and docs now omit `folders` by default and explain it
as an optional presentation override. Full `pnpm check`, `pnpm test`, and `pnpm build` pass.
The Mermaid sequence-diagram fixes are applied in the mandalarepo corpus. Acrolls heading
anchors now preserve deep-link IDs without rendering a literal `#` before headings. The local
mdsvex package was rebuilt and mandalarepo's `pnpm check` and `pnpm build` pass.
The CLI TTY walkthrough now presents one pending checkpoint at a time and waits for Enter or
`next`; `q` pauses. Batch output remains available via `--non-interactive`, and the JSON plan is
unchanged for agents or a future modal client. CLI tests, typecheck, and build pass.
ADR-0001 records the CLI-first guided onboarding decision in `acrolls/docs/adr/`.
ADR-0002 records the proposed CUBE-based styling redesign, composable `layout`/`color-theme`/
`typography` responsibilities, and the required layout and typography quality review. The
installability gap is now addressed in the working tree: `packages/acrolls` provides the unscoped
`acrolls` executable wrapper around `@acrolls/cli`; the CLI also accepts `--cwd <path>` so a host
can be targeted without changing directories. Boolean flag parsing was hardened so flags before
the command do not consume the command as a value.

The complete CLI product contract is recorded in `acrolls/PRODUCT.md` under “Complete CLI flow”
behavior 37–63. The CLI package now has 9 passing tests (including flag-order coverage),
typecheck/build pass, the wrapper check passes, and the local wrapper successfully runs
`--cwd ... --non-interactive onboard`.

## Decisions

- Onboarding is guidance-only; `integrate` remains the explicit reviewed mutation command.
- Use `@acrolls/mdsvex` directly in external hosts; do not install workspace-only
  `@acrolls/sveltekit` through `file:`.
- Route file paths follow the chosen `--base-href`; content glob and metadata glob are generated
  identically with a matching `contentPrefix`.
- The flow recommends one style preset per docs surface and warns against nested `DocsShell` in a
  host-owned three-column shell.
- Migration `error-page` is explained as a visible Markdown replacement, not runtime exclusion;
  executable `.svx` remains fail-fast.
- Deployment provider, adapter, environment, and base-path behavior remain host-owned.
- `acrolls` is the user-facing executable package; `@acrolls/cli` is the implementation package.
- Publish runtime packages first, then `@acrolls/cli`, then the unscoped `acrolls` wrapper.
- `--cwd` is equivalent to running from the host root and is safe to combine with
  `--non-interactive` or `--json`.

## Remaining

- [ ] Use `acrolls onboard` during the next external website trial and capture any host-specific
      instructions that should become new generic checkpoints.
- [ ] Publish the runtime packages, `@acrolls/cli`, and the `acrolls` wrapper in the documented
      order, then verify `pnpm add -D acrolls && pnpm exec acrolls` from a clean host.
- [ ] Build a modal UI that renders `acrolls onboard --json` without duplicating the plan.
- [x] Commit the Acrolls implementation/docs/specs/tests/examples as `748c8e1`.
- [x] Add the GitHub remote and push `main` to `origin`.
- [ ] Commit and push the CLI-first documentation pass after the next host trial decision.
- [x] Fix root-base URL joining and add coverage for natural root routes and landing overrides.
- [x] Clarify that `folders` is optional and filesystem navigation is automatic by default.

## Gotchas

- Run the command from the host root, not the Acrolls monorepo root.
- For local packages, Acrolls must be built before the host refreshes `file:` dependencies.
- `--base-href /handbook` means routes belong under `src/routes/handbook`, not `src/routes/docs`.
- The wizard does not execute package install, edit files, start servers, or deploy anything.
- A local clone can run the wrapper before workspace links are rebuilt; a clean registry install
  requires the documented package release sequence.
- The GitHub remote is `https://github.com/fractalmandala/Acrolls.git`; `main` tracks `origin/main`.
- The untracked `ref/` reference clones and `twreplace.css` were intentionally left out of the
  Acrolls commit.

## Key files

- `/Users/amrit/acrolls/packages/cli/src/onboarding.ts` — plan, snippets, renderer, interactive CLI.
- `/Users/amrit/acrolls/packages/cli/src/index.ts` — command and help wiring.
- `/Users/amrit/acrolls/packages/cli/src/util.ts` — argument parsing, including boolean/value flag
  boundaries.
- `/Users/amrit/acrolls/packages/cli/src/util.test.ts` — flag-order regression coverage.
- `/Users/amrit/acrolls/packages/acrolls/` — installable unscoped CLI wrapper.
- `/Users/amrit/acrolls/packages/cli/src/onboarding.test.ts` — host-aware path and output tests.
- `/Users/amrit/acrolls/docs/cli.md` — human CLI guide and onboarding cautions.
- `/Users/amrit/acrolls/llms.txt` — compact agent map and deployment handoff.
- `/Users/amrit/acrolls/docs/getting-started.md` — human path cross-linked to onboarding.
- `/Users/amrit/acrolls/PRODUCT.md` — complete CLI product contract, behavior 37–63.
- `/Users/amrit/acrolls/TECH.md` — onboarding runtime/checkpoint architecture.
