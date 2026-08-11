# acrolls deployment learnings

Blocking: every nested docs page receives an empty slug.
[src/routes/docs/[...slug\]/+page.ts (line 1)](/Users/amrit/mandala/packages/fractalsvelte/src/routes/docs/[...slug]/+page.ts:1) always returns { slug: '' }. It never reads params.slug, so /docs/anything cannot load the requested document.
It should follow Acrolls’ canonical loader: read params.slug, validate with docs.get(slug), and return that slug.

pnpm check currently fails with four errors.
The custom NodeNext settings in [tsconfig.json (line 12)](/Users/amrit/mandala/packages/fractalsvelte/tsconfig.json:12) override SvelteKit’s generated bundler configuration. This causes the $types import error and unresolved $lib/docs/source diagnostics.
Remove the explicit module/moduleResolution overrides and use SvelteKit’s defaults.

The Acrolls publication layout is not wired in.
[`vite.config.ts`](/Users/amrit/mandala/packages/fractalsvelte/vite.config.ts) uses the lower-level @acrolls/mdsvex preprocessor without a layout option. Therefore frontmatter titles are not automatically rendered through PublicationLayout; [DocumentPage.svelte (line 9)](/Users/amrit/mandala/packages/fractalsvelte/src/lib/docs/DocumentPage.svelte:9) only renders <Publication>.
Current Markdown files often contain a body # Heading, which masks this problem. Documents without one will lack the expected Acrolls title/banner.

There is stale legacy loading code.
[src/lib/docshell/load.ts (line 3)](/Users/amrit/mandala/packages/fractalsvelte/src/lib/docshell/load.ts:3) still searches nonexistent /src/content/components and /src/content/blocks paths, while the new source is under the package-root docs/ directory. It appears unused, but it conflicts with the new architecture and should be removed or migrated.

Folder configuration is incomplete.
[src/lib/docs/source.ts (line 30)](/Users/amrit/mandala/packages/fractalsvelte/src/lib/docs/source.ts:30) explicitly configures only areas and components, while the docs contain design, feature-plans, fractalengine-adr, guides, and plans too. Acrolls will auto-discover them, so this is not the main breakage, but labels and ordering will be inconsistent.

---

## Results after implementing the five fixes

All five fixes above were applied. Outcome per fix, then the resulting gate status, then a new blocker the layout fix surfaced.

### 1. Nested-slug loader — FIXED
[src/routes/docs/[...slug\]/+page.ts](/Users/amrit/mandala/packages/fractalsvelte/src/routes/docs/[...slug]/+page.ts) now reads `params.slug`, validates with `docs.get(slug)` (404 on miss), and exposes an `entries` generator for prerendering. Nested documents resolve correctly.

### 2. tsconfig NodeNext override — FIXED
Removed `module: "NodeNext"` and `moduleResolution: "NodeNext"` from [tsconfig.json](/Users/amrit/mandala/packages/fractalsvelte/tsconfig.json); it now inherits SvelteKit's bundler resolution from `.svelte-kit/tsconfig.json`. The `$types` and `$lib/docs/source` diagnostics are gone. **`pnpm check` now passes: 0 errors, 0 warnings across 6309 files.**

### 3. Publication layout wiring — APPLIED, but introduced a new build blocker
[vite.config.ts](/Users/amrit/mandala/packages/fractalsvelte/vite.config.ts) now passes `layout: { _: <@acrolls/svelte>/dist/PublicationLayout.svelte }` to `createAcrollsMdsvexPreprocessor`, and [DocumentPage.svelte](/Users/amrit/mandala/packages/fractalsvelte/src/lib/docs/DocumentPage.svelte) no longer double-wraps in `<Publication>` (the layout supplies it).

This is **incompatible with the project's forced runes mode**. `vite.config.ts` sets `compilerOptions.runes = true` for every file outside `node_modules`, which includes the compiled `.md`. mdsvex's layout mechanism wraps each document in a generated shim that passes frontmatter via legacy **`$$props`** and a classic **`<slot>`** — both illegal under `runes: true`. Result:

```
error during build: Build failed with 192 errors
docs/areas/ai.md:10:27  Cannot use `$$props` in runes mode
… (one per document, all 192)
```

`PublicationLayout.svelte` itself is fine (it lives in `node_modules`, exempt from forced runes). The illegal `$$props` is in the **mdsvex-generated wrapper inside each doc**, not in the layout component. Acrolls-level finding: **the mdsvex `layout` option cannot be used when the host forces Svelte 5 runes mode**; Acrolls needs a runes-compatible layout injection (or the banner must be rendered host-side, e.g. via `renderBannerHtml`/`Publication` in `DocumentPage`, rather than through the mdsvex layout).

### 4. Stale legacy loader — FIXED
Deleted `src/lib/docshell/load.ts` (searched nonexistent `/src/content/*`). Its only consumer, the unused `src/lib/docshell/DocPage.svelte`, was also deleted. `Header.svelte`'s live dependencies (`ThemeSwitcher`, `DocSearch`, `nav`) are untouched.

### 5. Folder configuration — FIXED
[src/lib/docs/source.ts](/Users/amrit/mandala/packages/fractalsvelte/src/lib/docs/source.ts) now labels and orders all seven folders: Architecture Areas, Guides, Components, Design System, Plans, Feature Plans, ADRs.

### Still open underneath (masked, not resolved)
Gap #1 — `MISSING_EXPORT "metadata"` on the **70 frontmatter-less files** (`components/native-components/` ×46, `components/svelte/` ×24). mdsvex only emits `export const metadata` when a file has frontmatter, and the source uses `import.meta.glob(..., { eager: true, import: 'metadata' })`, so any frontmatter-less `.md` hard-fails the build. The `$$props` error (fix #3) now aborts compilation earlier, so these are hidden this run but will reappear once #3 is resolved.

### Gate status after the five fixes
| Gate | Status |
|---|---|
| `pnpm check` | PASS — 0 errors, 0 warnings |
| `pnpm build` | FAIL — 192 × `$$props` (from fix #3), then 70 × `MISSING_EXPORT` (gap #1) behind it |

---

## Learnings from the final Acrolls correction

The final fix resolved both build failures without requiring frontmatter in every
document or replacing Acrolls' mdsvex layout integration. These are the lessons to
carry into future Acrolls hosts and package development.

### Treat generated Markdown as a compiler boundary

The earlier conclusion that the mdsvex `layout` option is incompatible with Svelte 5
runes was too broad. The actual conflict came from the host forcing `runes: true` onto
mdsvex-generated `.md` and `.svx` modules. Those modules contain the legacy-compatible
`$$props` wrapper used by mdsvex layouts.

Hosts can still force runes mode for their authored `.svelte` components, but they must
let Svelte auto-detect the mode for Markdown, SVX, and dependencies:

```ts
compilerOptions: {
	runes: ({ filename }) => {
		const isDependency = filename.split(/[/\\]/).includes('node_modules');
		const isMarkdown = filename.endsWith('.md') || filename.endsWith('.svx');

		return isDependency || isMarkdown ? undefined : true;
	}
}
```

This preserves the host's runes policy while keeping mdsvex's generated layout wrapper
valid. Acrolls does not need a separate runes-only layout injection mechanism for this
case.

### Frontmatter must remain optional

A document without YAML frontmatter is valid Acrolls content. It must not break the
entire documentation route merely because a host builds navigation with an eager named
export glob such as `import: 'metadata'`.

`@acrolls/mdsvex` now guarantees that every compiled `.md` and `.svx` module has a named
`metadata` export:

- Real frontmatter keeps the metadata generated by mdsvex.
- A document with no metadata binding receives `export const metadata = {};`.
- An existing unexported `metadata` binding is exported without being redeclared.
- A binding exported only under an alias also receives the required `metadata` export.

Navigation can therefore fall back to the configured folder title or a humanized
filename. A body `# Heading` remains article content; it is not required metadata and
does not need to be promoted into frontmatter automatically.

### Analyze generated code as code, not text

The first metadata safeguard used regular expressions. That approach could mistake
comments, strings, or `export { metadata as pageMetadata }` for the required named
export, and it could redeclare an existing local binding.

The corrected implementation parses module scripts with Acorn and the Svelte
TypeScript parser. Syntax-aware analysis handles JavaScript, TypeScript, destructured
bindings, classic `context="module"` scripts, and Svelte 5 `<script module>` syntax
without false positives. Parser packages used at runtime must be declared as runtime
dependencies, not development-only dependencies.

### Fix systemic content failures in Acrolls

Seventy frontmatter-less documents exposed one package-level contract failure. Adding
frontmatter to all seventy files would have hidden the defect while leaving the next
host vulnerable. When ordinary Markdown causes a generated-module failure, fix the
normalization or compilation layer and add regression coverage there.

The metadata tests now cover documents with and without frontmatter, existing module
scripts, instance scripts, local bindings, aliased exports, misleading comments and
strings, and typed Svelte 5 module scripts.

### A type check is not an integration build

`svelte-check` passed before either production-build failure was visible. The complete
gate for an Acrolls host must include both:

1. Run `svelte-check` to validate authored Svelte and TypeScript.
2. Run the production Vite/SvelteKit build to compile every generated Markdown module,
   resolve named exports, and exercise the deployment adapter.

For this integration, the final gate was 19 passing mdsvex tests, passing Acrolls check
and build commands, zero host check errors or warnings, and a successful full host
production build. The fresh-review verdict was **ship**.

### Refresh local `file:` dependencies deliberately

Building a local Acrolls package does not guarantee that pnpm refreshes an already
copied `file:` dependency in the host's `node_modules`. After changing Acrolls, rebuild
the package and reinstall the host dependency. During diagnosis, refresh only the exact
package link when a workspace-wide install would remove or reconstruct unrelated
modules. Do not treat stale copied output as evidence that the source fix failed.
