---
task: fractalmandala-docs-content-prep
status: complete
updated: 2026-08-11
---

# Handoff — Fractal Mandala docs content preparation and wiring

## Role in the Acrolls work

Fractal Mandala is a dogfooding and acceptance fixture for the Acrolls product. This
integration exists to test Acrolls against a realistic, nested SvelteKit documentation tree,
identify user-facing friction, and feed those findings back into Acrolls, its examples, and
its user documentation. It is not an independent endpoint or a reason to preserve
site-specific plumbing as the long-term public API.

The current fixture specifically tests three requirements: a configurable docs mount whose
shell begins at `/docs` without making `/docs` an implicit article; folder nodes that can also
link to their own `index.md` landing page; and mixed siblings where files and child folders
coexist at one level. These findings belong in Acrolls' generalized page-tree model.

## Completed

Prepared both content trees for Acrolls generated Markdown navigation:

- `sites/fractalmandala/docs/text-collection-organization/`
- `sites/fractalmandala/docs/user-guide/`

All 62 Markdown pages now:

- use lowercase ASCII kebab-case filenames and parent directories;
- contain YAML `title` and `description` frontmatter;
- preserve their original human-readable titles, including Sanskrit diacritics;
- no longer contain the original leading H1.

Descriptions were derived from each page’s opening summary. Two ignored macOS `.DS_Store`
files were removed because they prevented the old, renamed directories from being removed;
no documentation content was deleted.

## Verification

- Structural validation passed for all 62 Markdown files.
- No leading H1 remains in either tree.
- `pnpm check` in `sites/fractalmandala` passes with 0 errors and 0 warnings.

## Acrolls integration

The docs area is now wired to the generated Acrolls content source:

- `sites/fractalmandala/src/lib/docs/source.ts` scans every Markdown file under `docs/`;
- the first directory level becomes a navigation section;
- deeper directories become nested navigation groups;
- frontmatter supplies titles and descriptions;
- `src/routes/docs/[...slug]/` serves every generated document route;
- `src/routes/docs/+page.ts` redirects `/docs` to `/docs/user-guide/getting-started`;
- `src/lib/docs/nav.ts` remains as a compatibility export, but no longer owns navigation data.

The public mount remains configurable through `baseHref: '/docs'`; changing that value does
not require changing the filesystem content root.

## Verification

- `pnpm check` in `sites/fractalmandala` passes with 0 errors and 0 warnings. 
- `pnpm build` passes successfully across the full Markdown tree.
- The production build still reports pre-existing accessibility and malformed-list warnings
  in unrelated Markdown content; these do not block the build.

## Future integration step

If the docs are later split into separate public surfaces, create separate sources with distinct
`baseHref` and `storageKey` values. The current source intentionally treats the complete
`sites/fractalmandala/docs/` tree as one docs surface.

The original preparation note was:

```ts
import.meta.glob('../../docs/text-collection-organization/**/*.md', {
  import: 'default'
});
```

Use `title` and `description` from the eager `metadata` glob and configure the docs base href
separately for the text-collection and user-guide sections only if they should become separate
docs areas.
