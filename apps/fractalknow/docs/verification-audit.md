# FractalKnow Cross-Cutting Verification Audit

Date: 2026-07-31
Scope: `/Users/amrit/fractals/apps/fractalknow`

## Decisions

- Verification is split by blast radius: Vitest `unit` covers Svelte stores and pure command/document services, Vitest `component` covers migrated Svelte shell surfaces in jsdom, and Playwright covers user-facing browser flows against the SvelteKit app.
- Playwright targets the Tauri dev port `127.0.0.1:1420` and reuses an existing server when present, matching the current desktop preview setup.
- Accessibility verification is documented in `docs/accessibility-audit.md` and encoded as role/name-based component and Playwright assertions for dialogs, sidebar navigation, editor controls, terminal controls, and workspace landmarks.
- Bundle verification is documented in `docs/bundle-audit.md`; `pnpm run audit:bundle` reports built client artifact sizes and dynamic import sites after `pnpm build`.
- Root verification is wired from `/Users/amrit/fractals` through `pnpm run check`, `pnpm run build`, and `pnpm run test`, each delegated to the `fractalknow` workspace package.

## Current Known Gaps

- Rust unit tests cover menu id consistency, accelerator mapping helpers, deep-link scheme validation, project scaffolding, and menu enablement registry state. Full invoke-handler integration tests against a running Tauri app are still missing.
- Bundle-size thresholds must be re-audited after editor, collaboration, and terminal dependencies are finalized.
- Playwright flows cover the migrated shell behavior available today; deeper file-system backed project creation and native dialogs require project-backed file IO to be completed.
- Mermaid diagrams currently render as source fallback figures, not interactive diagram graphics.
