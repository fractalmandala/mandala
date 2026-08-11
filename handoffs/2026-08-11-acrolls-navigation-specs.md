---
task: acrolls-navigation-runtime-fix
status: completed
host: codex-desktop
branch: main
boss: code
updated: 2026-08-11T09:18:00+05:30
---

# Acrolls navigation contract specs

## Where we are

Completed. The package and Mandala fixture were rebuilt and browser-verified after the final
artifact refresh.

## Workspace

- Product repo: `/Users/amrit/acrolls`
- Branch: `main`
- Inspected commit: `d2d193c4454e0c9bcf3d9992c881db94548320db`
- Fixture repo: `/Users/amrit/mandala`
- Fixture branch: `main`
- Fixture inspected commit: `600c429aae73747b0af867ba42ec88d9d848f283`

### Delivered

- `/Users/amrit/acrolls/PRODUCT.md` now includes the generated docs source and recursive
  navigation feature with 25 user-facing behavior invariants.
- `/Users/amrit/acrolls/PRODUCT-TECH.md` defines the implementation plan, current code gaps,
  tests, risks, and execution order.
- `@acrolls/docs` now supports host-defined recursive navigation, top-level section landing
  links, and the two layout compositions described below.
- Fractal Mandala now places `DocsSidebar` in its existing app-shell sidebar rather than
  nesting `DocsShell` inside the center column.
- Acrolls now documents YAML frontmatter `title`/`description` as the default display metadata
  contract, and Fractal Mandala renders those values through `Banner` in its host-composed
  article route.
- Fractal Mandala normalizes legacy Notion `file://` Markdown destinations with literal spaces
  before mdsvex parsing, so exported source links become real anchors with `%20`-encoded URLs.
- Fixed a production `each_key_duplicate` regression caused by bounded `slugify()` output
  collapsing long sibling page IDs. Generated navigation now uses full-length `stableId()`
  identities, with a regression test covering the long shared-prefix case.
- Learning captured in the project-scoped continuous-learning store: generated navigation
  identity must be audited before renderer debugging, and generated-data collision checks must
  precede browser/visual verification.
- Added a defensive runtime ID-claim pass in `DocsSidebar` so stale or malformed host IDs are
  suffixed deterministically instead of crashing keyed navigation rendering. The specs now also
  require package-dist and host-artifact verification when consuming file-linked packages.
- The comparable component-extension research is documented in
  `/Users/amrit/acrolls/docs/research/component-extension-models.md`.
- Navigation IDs now preserve separators as part of their full deterministic identity, covering
  distinct route shapes that previously normalized to the same display slug.
- Explicit page overrides now drive the resolved document metadata, visibility, and ordering;
  group landing overrides reach the host article record while a direct landing-page entry wins.
- Group and folder badges now reach generated navigation at every depth and nested badges render
  in `DocsNavTree`.
- The `file://` Markdown normalizer now handles multiple links on one line independently, with a
  direct Node test preventing the greedy-match regression.

## Remaining

No remaining work for the duplicate-key fix. Final browser QA used a fresh Mandala Vite server
on `127.0.0.1:5175` after refreshing the local `file:` package: 98 navigation links rendered,
client-side navigation to Getting Started succeeded, and the browser console had no errors.

Separate follow-up candidates remain: malformed Markdown closing tags, noninteractive
`tabIndex` warnings, and a development-only hydration-mismatch warning observed in the host.
None was an `each_key_duplicate` error or introduced by this navigation fix.

## Decisions

The host/user owns the definition of what is linked, at what level, and whether an entry is a
page or group. Acrolls owns scaffolding that definition into consistent routes, navigation,
breadcrumbs, pager order, and static entries. Filesystem conventions such as `index.md` and
folder nesting are fallback defaults only.

## Gotchas

- Preserve existing uncommitted work in both repositories.
- Do not reset, clean, stash, or commit unrelated changes.
- Keep `hidden` as unlisted navigation state, not access control.
- Do not add CMS, search, remote content, or automatic `.svx` discovery in this slice.

- The user reported the duplicate key three times. Browser evidence now exists: a fresh
  server on port 5175 rendered the refreshed file-linked package without console errors.
- The Vite warnings for malformed Markdown closing tags and noninteractive `tabIndex` values
  are separate host-content warnings and remain unresolved.
- Both repositories contain substantial pre-existing user changes. The current Mandala status
  includes many content edits unrelated to this fix; do not reset, clean, stash, or commit them.

## Verification

- `pnpm --filter @acrolls/docs test` — 23 tests passed.
- `pnpm --filter @acrolls/docs check` and `pnpm --filter @acrolls/sveltekit check` — clean.
- `pnpm build` in Acrolls; direct Mandala `svelte-check`, Node file-link test, and Vite build — clean.
- Targeted `git diff --check` — clean (Git still reports its pre-existing fsmonitor IPC warning).
- Fresh independent review after remediation: `ship` after adding coverage for direct landing
  overrides and nested group badges.

### Layout composition correction

Fractal Mandala already owns a three-column `sidebar / center / sidebar` app shell. Nesting
the composed Acrolls `DocsShell` inside its center column contracts the docs shell's own
navigation/article/TOC layout and makes the screenshot look incorrectly styled. This is a
composition collision, not evidence that the generated navigation is wrong.

Acrolls has two supported layout compositions:

- `DocsShell`: complete page-level docs chrome, with `.acrolls-docs-shell__body` as the
  article grid, the left nav rail, and optional right TOC rail; `fullBleed` is available when
  a complete shell cannot be moved outside a constrained host wrapper.
- `DocsSidebar`: navigation-only primitive for hosts that already own their page-level grid.
  The host places it in its existing sidebar and owns the center/right regions.

Fractal Mandala is being rewired to the second composition.

### Component extension research

The comparison note is in
`/Users/amrit/acrolls/docs/research/component-extension-models.md`. The common boundary is
that content components extend the authoring vocabulary, while navigation and page chrome
remain separate framework surfaces. SVOCS uses imported Svelte components in `.svx`,
DocSmith exposes named Svelte components from `svelte-docsmith`, and Blume exposes built-in
MDX components plus an isolated example-preview primitive.

## Key files

- `/Users/amrit/acrolls/PRODUCT.md`
- `/Users/amrit/acrolls/PRODUCT-TECH.md`
- `/Users/amrit/acrolls/packages/docs/src/lib/content.ts`
- `/Users/amrit/acrolls/packages/docs/src/lib/nav.ts`
- `/Users/amrit/acrolls/packages/docs/src/lib/DocsNavTree.svelte`
- `/Users/amrit/acrolls/packages/docs/src/lib/nav.test.ts`
- `/Users/amrit/mandala/sites/fractalmandala/src/routes/docs/+layout.svelte`
- `/Users/amrit/mandala/sites/fractalmandala/src/routes/docs/[...slug]/+page.svelte`
- `/Users/amrit/mandala/sites/fractalmandala/svelte.config.js`
