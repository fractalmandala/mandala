# Starlight → blume Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing Astro + Starlight documentation site in `docs/` with blume v1.0.3, while maintaining dual-locale support (English + Japanese) and deployment to GitHub Pages (under the `/svelte-meta-tags` subpath).

**Architecture:** blume is a markdown-first framework that generates a static site by scanning a content folder (`docs/content/`). Configuration is handled via a single `blume.config.ts` file, and the sidebar is auto-generated based on the file structure combined with `meta.ts` files in each folder. Japanese content is managed via a `content/ja/` mirror, with automatic fallback to English for untranslated pages.

**Tech Stack:** blume ^1.0.3 (includes Astro + Vite), pnpm workspace (catalog mode), GitHub Pages (`actions/upload-pages-artifact` + `actions/deploy-pages`)

**Spec:** `superpowers/specs/2026-07-15-blume-migration-design.md`

> **✅ Status (as of 2026-07-19): Upstream Issue #72 has been resolved; work resumed with blume 1.1.0 (released 2026-07-19).**
> [Issue #72](https://github.com/haydenbleasel/blume/issues/72) is now closed. Updated `catalog.blume` to `^1.1.0` and confirmed that **Task 2 Step 5 succeeded** after running `pnpm install` followed by `pnpm --filter docs build` (files such as `index.html` and `ja/index.html` were generated in `docs/dist/`, and `deployment.base: /svelte-meta-tags` was correctly applied to all links).
>
> Blume 1.1.0 introduces new transitive dependencies—`takumi-js` and `@takumi-rs/*` (including native binaries). As these were newly released, they were initially blocked by the `minimumReleaseAge: 4320` rule; consequently, `takumi-js` and `'@takumi-rs/*'` have been added to `minimumReleaseAgeExclude` (for the same reason `blume` itself was excluded).
>
> Tasks 1 through 8 are complete (covering content migration, Starlight removal, URL reconciliation, CI updates, final verification, and addressing preview feedback). Only Task 8 Step 4 (finalization and PR merging) remains.

## Global Constraints

- Blume version `^1.0.3`, Node.js 22.12+ (the repository meets this with 24.17.0; do not modify `devEngines` or `packageManager` in the root `package.json`).
- Dependency versions must be defined in the `catalog:` section of `pnpm-workspace.yaml` and referenced via `"catalog:"` in `docs/package.json` (direct pinning is prohibited).
- Maintain `minimumReleaseAge: 4320` in `pnpm-workspace.yaml`.
- GitHub Actions must use commit SHA pinning accompanied by a `# vX.Y.Z` comment (bare tags are prohibited).
- Prettier: 120-character line length, single quotes, no trailing commas. Ensure the equivalent of `pnpm format` passes before committing changes for each task.
- Changesets are **not required** (internal changes affecting only the docs site).
- Working branch: `docs/migrate-to-blume` (already created).
- If `pnpm install` is blocked in the sandbox, ask the user to run `! pnpm install` (do not implement unauthorized workarounds).

## Overall Mapping: Old vs. New

| Current (Starlight)                        | After Migration (blume)                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `docs/astro.config.mjs`                    | `docs/blume.config.ts`                                                                     |
| `docs/src/content/docs/**`                 | `docs/content/**`                                                                          |
| `docs/src/content/docs/ja/**`              | `docs/content/ja/**`                                                                       |
| `docs/src/assets/*.svg`                    | `docs/public/*.svg`                                                                        |
| `docs/src/styles/custom.css`               | Removed (add `docs/theme.css` only if table layouts break during Task 8 visual checks)     |
| `docs/src/content.config.ts`               | Removed (handled internally by blume)                                                      |
| `docs/tsconfig.json`                       | Updated to blume's recommended settings (required for `blume check` to inspect authored files) |
| `sidebar` + `translations` in astro.config | Folder `meta.ts` / `meta.$.ts` + page frontmatter `sidebar.order`                          |
| `withastro/action`                         | `pnpm --filter docs build` + official Pages action                                         |

Final sidebar structure (English; Japanese uses the same structure with translated labels in `meta.ts`):

```text
(index)               ← content/index.mdx
Installing            ← Page, sidebar.order: 1
Usage                 ← Page, sidebar.order: 2
Deep Merge function   ← Page, sidebar.order: 3
Migration Guide       ← Page, sidebar.order:
``` 4
MetaTags Properties   ← Group, meta.ts order: 1
Open Graph            ← Group, meta.$.ts order: 2
JSON-LD               ← Group, meta.$.ts order: 3
Types                 ← Group, meta.ts order: 4
```

*Note: In blume's flat view, pages not belonging to a group are always displayed above the groups (this ordering is approved by the specification).*

---

### Task 1: Switch dependency to blume

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `docs/package.json`
- Modify: `.gitignore`

**Interfaces:**

- Outcome: `pnpm --filter docs exec blume <cmd>` is functional (all subsequent tasks depend on this).

- [x] **Step 1: Update the catalog in `pnpm-workspace.yaml`**

Remove the four lines `'@astrojs/check'`, `'@astrojs/starlight'`, `astro`, and `sharp` from `catalog:` (these are dependencies specific to `docs`; confirmed unused in other workspaces), and add `blume` in the alphabetical position (where the `astro` line used to be). Remove `sharp: true` from `allowBuilds:` (keep `esbuild: true`).

Additionally, since blume 1.0.3 has been published for less than three days, it would be blocked by `minimumReleaseAge: 4320`; therefore, add `blume` to `minimumReleaseAgeExclude` (user-approved; `minimumReleaseAge` itself remains unchanged). The modified block:

```yaml
minimumReleaseAge: 4320

minimumReleaseAgeExclude:
- blume

allowBuilds:
esbuild: true

catalog:
'@changesets/cli': ^2.31.0
'@eslint/compat': ^2.1.0
'@eslint/js': ^10.0.1
'@playwright/test': ^1.61.1
'@sveltejs/adapter-auto': ^7.0.1
'@sveltejs/kit': ^2.69.2
'@sveltejs/package': ^2.5.8
'@sveltejs/vite-plugin-svelte': ^7.2.0
'@type s/eslint': ^9.6.1
blume: ^1.0.3
eslint: ^10.7.0
```

(Do not modify existing lines following `eslint`. Leave `minimumReleaseAge: 4320` and `packages:` as they are.)

- [x] **Step 2: Update `docs/package.json`**

Set the entire content to the following:

```json
{
"name": "docs",
"private": true,
"type": "module",
"scripts": {
"dev": "blume dev",
"start": "blume dev",
"check": "blume check",
"build": "blume build",
"preview": "blume preview"
},
"dependencies": {
"blume": "catalog:",
"typescript": "catalog:"
}
}
```

(Keep `typescript` for `blume check` (which runs `astro check` internally). Remove the `astro` script entries.)

- [x] **Step 3: Add `.blume/` to the root `.gitignore`**

Add it immediately after the `.astro/` line:

```text
.astro/
.blume/
```

(`dist` is already covered by an existing line.)

- [x] **Step 4: Install**

Run: `pnpm install`
Expected: Completes without errors. `docs/node_modules/.bin/blume` exists.

- [x] **Step 5: Verify blume is working**

Run: `pnpm --filter docs exec blume --version`
Expected: `1.0.3` (or a later 1.0.x version)

- [x] **Step 6: Commit**

```bash
git add pnpm-workspace.yaml docs/package.json .gitignore pnpm-lock.yaml
git commit -m "docs: replace starlight deps with blume"
```

---

### Task 2: Create blume.config.ts and assets, and complete the initial build

**Files:**

- Create: `docs/blume.config.ts`
- Create: `docs/content/index.mdx`
- Move: `docs/src/assets/light-logo.svg` → `docs/public/light-logo.svg`
- Move: `docs/src/assets/dark-logo.svg` → `docs/public/dark-logo.svg`
- Modify: `docs/tsconfig.json`

**Deliverables:**

- Result: A blume project skeleton where `pnpm --filter docs build` succeeds. The `content/` directory serves as the location for content in subsequent tasks. - [x] **Step 1: Move logos to `public/`**

```bash
git mv docs/src/assets/light-logo.svg docs/public/light-logo.svg
git mv docs/src/assets/dark-logo.svg docs/public/dark-logo.svg
```

(Leave `docs/public/favicon.svg` as is; no configuration is needed as Blume automatically detects the favicon file in `public/`.)

- [x] **Step 2: Create `docs/blume.config.ts`**

```ts
import { defineConfig } from 'blume';

export default defineConfig({
title: 'SvelteMetaTags',
description: 'Svelte Meta Tags provides components designed to help you manage SEO for Svelte projects.',
content: { root: 'content' },
logo: {
image: { light: '/light-logo.svg', dark: '/dark-logo.svg', alt: 'SvelteMetaTags' },
text: ''
},
github: { owner: 'oekazuma', repo: 'svelte-meta-tags', dir: 'docs' },
i18n: {
defaultLocale: 'en',
locales: [
{ code: 'en', label: 'English' },
{ code: 'ja', label: '日本語' }
]
},
deployment: {
site: 'https://oekazuma.github.io',
base: '/svelte-meta-tags'
}
});
```

(Explicitly setting `content.root` is required because the default is `docs`. `logo.text: ''` corresponds to Starlight's `replacesTitle: true`, meaning only the logo image is displayed. Add `redirects` only if needed in Task 6.)

- [x] **Step 3: Create the home page `docs/content/index.mdx`**

Replaces the current `docs/src/content/docs/index.mdx` (splash + hero). Since blume lacks a "splash" template, this is implemented as a standard page (spec approved):

```mdx
---
title: Svelte Meta Tags
description: Svelte Meta Tags provides components designed to help you manage SEO for Svelte projects.
seo:
title: Svelte Meta Tags ・ Components to manage SEO
description: Svelte Meta Tags is a Svelte library to manage SEO meta tags in your Svelte applications. It provides a set of components to manage the meta tags in your Svelte applications.
---

<CardGroup cols={2}>
<Card title="Effortless SEO Management" icon="rocket">
Easily manage SEO meta tags with a simple interface for more effective search engine optimization.
</Card>
<Card title="JSON-LD Support" icon="file-text">
Offers JSON-LD support for structured data, which is essential for search engine optimization.
</Card>
<Card title="Deep Merge Functionality" icon="puzzle">
The deep merge function allows you to easily manage meta tags in complex Svelte applications.
</Card>
<Card title="TypeScript Friendly" icon="code">
Includes TypeScript support to help you manage meta tags in a type-safe way.
</Card>
</CardGroup>

<CardGroup cols={2}>
<Card title="Get started" icon="arrow-right" href="/installing">
Install Svelte Meta Tags and set up your first meta tags.
</Card>
<Card title="View on GitHub" icon="github" href="https://github.com/oekazuma/svelte-meta-tags">
Browse the source, open issues, and contribute.
</Card>
</CardGroup>
```

Note: blume icons use Lucide names (kebab-case). Starlight icons have been replaced: `document` → `file-text`, `seti:typescript` → `code`. `Card` and `CardGroup` are built-in and do not require imports. Internal links are written without the base path (e.g., `/installing`), as blume automatically rewrites them to include `deployment.base`. - [x] **Step 4: Update `tsconfig` to the recommended blume configuration**

Replace the entire content of `docs/tsconfig.json` with the following (this is the recommended configuration listed in the blume CLI reference; without a `tsconfig` at the project root, `blume check` only inspects the generated runtime):

```json
{
"extends": "astro/tsconfigs/strict",
"include": [".blume/.astro/types.d.ts", ".blume/src/env.d.ts", "**/*"]
}
```

- [x] **Step 5: Verify build — Successful as of 2026-07-19 (blume 1.1.0, after Issue #72 was resolved)**

Run: `pnpm --filter docs build`
Expected: `[build] Complete!` and a build summary (`Output static` / `Search orama` / `Sitemap yes`) appear, and `docs/dist/` is generated. The old `docs/src/content/docs/**` remains, but since blume only looks at `content/`, there is no interference.

Actual result (1.1.0): Success. `Sitemap yes` / `Ro



# Documentation Site Content Overhaul: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite all content for the `docs/` site (English + Japanese) to perfectly match the implementation in `packages/svelte-meta-tags/src/lib/`, and restructure the information architecture to include new "Quick Start" and "Utilities" pages.

**Architecture:** Uses blume's filesystem-derived routing (`docs/content/**`, with locale-specific content in `content/ja/**`). Each page consists of frontmatter (`title`, `sidebar.order`) and Markdown/MDX body content. Group display names and ordering are controlled via folder-level `meta.ts` (locale-specific labels) or `meta.$.ts` (labels shared across all locales).

**Tech Stack:** blume 1.1.0, Markdown/MDX, schema-dts (JSON-LD types)

**Spec:** `superpowers/specs/2026-07-19-docs-content-overhaul-design.md`

## Global Constraints

- Scope is limited to `docs/content/**` (English) and `docs/content/ja/**` (Japanese). Do not modify code in `docs/blume.config.ts` or `packages/svelte-meta-tags/src/lib/`.
- Proceed with each task in the order of "Write English page → Write corresponding Japanese page" (do not complete all English pages before starting Japanese pages).
- Japanese text must match the writing style of existing pages (polite *desu/masu* style).
- Type signatures must match `packages/svelte-meta-tags/src/lib/types.d.ts` exactly, character for character (including property names, optional modifiers, and the order of literal types). - Prettier: 120-character line length, single quotes, no trailing commas. Ensure `pnpm format` passes before committing changes for each task.
- Changesets are **not required** (internal changes affecting only the documentation site).
- Working branch: `docs/migrate-to-blume` (existing branch; continue using the same branch used for the Starlight-to-blume migration).

## Reference: Exact implementation specifications (common to all tasks)

The following are the exact specifications derived from `packages/svelte-meta-tags/src/lib/`, to be used in subsequent tasks.

**`Twitter` interface (`types.d.ts:44-66`):**

```ts
interface Twitter {
cardType?: 'summary' | 'summary_large_image' | 'app' | 'player';
site?: string;
title?: string;
description?: string;
creator?: string;
creatorId?: string;
image?: string;
imageAlt?: string;
player?: string;
playerWidth?: number;
playerHeight?: number;
playerStream?: string;
appNameIphone?: string;
appIdIphone?: string;
appUrlIphone?: string;
appNameIpad?: string;
appIdIpad?: string;
appUrlIpad?: string;
appNameGoogleplay?: string;
appIdGoogleplay?: string;
appUrlGoogleplay?: string;
}
```

The `handle` property does not exist (it was renamed to `creator` in v4). **`LinkTag` interface (`types.d.ts:174-212`):**

```ts
interface LinkTag { 
rel: string; 
href: string; 
hrefLang?: string; 
title?: string; 
media?: string; 
sizes?: string; 
type?: string; 
color?: string; 
imagesrcset?: string; 
imagesizes?: string; 
integrity?: string; 
as?: 
| 'fetch' 
| 'audio' 
| 'audioworklet' 
| 'document' 
| 'embed' 
| 'font' 
| 'frame' 
| 'iframe' 
| 'image' 
| 'json' 
| 'manifest' 
| 'object' 
| 'paintworklet' 
| 'report' 
| 'script' 
| 'serviceworker' 
| 'shared worker' 
| 'style' 
| 'track' 
| 'video' 
| 'webidentity' 
| 'worker' 
| 'xslt'; 
crossOrigin?: 'anonymous' | 'use-credentials'; 
referrerPolicy?: ReferrerPolicy; // DOM built-in type. 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'
}
```

**`MetaTagsProps` (`types.d.ts:214-229`, including `keywords`):**

```ts
interface MetaTagsProps {
title?: string;
titleTemplate?: string;
robots?: string | boolean;
additionalRobotsProps?: AdditionalRobotsProps;
description?: string;
canonical?: string;
mobileAlternate?: MobileAlternate;
languageAlternates?: ReadonlyArray<LanguageAlternate>;
twitter?: Twitter;
facebook?: Facebook;
openGraph?: OpenGraph;
additionalMetaTags?: ReadonlyArray<MetaTag>;
additionalLinkTags?: ReadonlyArray<LinkTag>;
keywords?: ReadonlyArray<string>;
}
```

**`MetaTags.svelte` Behavior (Key Specifications):**

- The default value for `robots` is `'index,follow'`. The `<meta name="robots">` tag itself is omitted only when `robots === false`.
- `updatedTitle = title && (titleTemplate?.replace(/%s/g, title) ?? title)` — **All** instances of `%s` in `titleTemplate` (global replacement) are replaced by `title`. If `title` is missing, specifying only `titleTemplate` results in no output.
- In `$effect`, if `robots` is falsy (e.g., `false`) and `additionalRobotsProps` is set, a warning is logged: `console.warn('additionalRobotsProps cannot be used when robots is set to false')`.
- Twitter fallbacks: `twitter.title || openGraph?.title || updatedTitle`, `twitter.description || openGraph?.description || description`. There are no fallbacks for image-related properties.
- OpenGraph fallbacks: `og:url` defaults to `openGraph.url || canonical`. `og:title` is `openGraph.title || updatedTitle`. `og:description` is `openGraph.description || description`.
- `og:type` is determined via `openGraph.type.toLowerCase()`, and additional blocks are generated based on the following conditions:
- If `profile` and `openGraph.profile` exist → `profile:first_name`, etc.
- If `book` and `openGraph.book` exist → `book:author` (array), `book:isbn`, `book:release_date`, `book:tag` (array)
- If `article` and `openGraph.article` exist → `article:published_time`, etc.
- For `video.movie`, `video.episode`, and `video.tv_show`, the video block is generated unconditionally; for `video.other`, the video block is generated **only if `openGraph.video` exists** (includes `video:actor`/`video:actor:role`, `video:director`, `video:writer`, `video:duration`, `video:release_date`, `video:tag`, `video:series`).
- `openGraph.image` (singular) is **prepended** to `images` (plural) before output (order: `image` → `images[0]` → `images[1]` ...).
- For each entry in `additionalMetaTags`, the `http`


The `Equiv` field is renamed to the `http-equiv` attribute name in the output (it is not output as the attribute name `httpEquiv`).
- `keywords` are combined into a single `<meta name="keywords">` tag using `keywords.join(', ')`.

**Behavior of `JsonLd.svelte`:**

- The default `output` is `'head'`. If `'body'` is specified, it is output directly at the component's placement location, outside of `<svelte:head>`.
- If `schema` is an array, `'@context': 'https://schema.org'` is automatically added to each element; if it is a single object (including the `{'@graph': [...]}` format), it is added to the object itself.
- The `<script>` tag is constructed via string concatenation (e.g., `'<scri' + 'pt ...>'`) to prevent the HTML parser from misinterpreting the `<script>` tag.

**Precise merge rules for `deepMerge` (`deepMerge.ts`) (evaluated in order from top to bottom):**

1. If either `target` or `source` is `null` or `undefined`, return the one that exists (or `{}` if neither exists).
2. For each property, **if the target value is a `Date` instance or a function, use the target value** (it is not overwritten by the source value).
3. If the target value is not a `Date` or function, but **the source value is a `Date` instance or a function, use the source value**.
4. If both target and source are non-null objects that are not arrays (including class instances other than `Date`, not just simple object literals), perform a recursive `deepMerge`.
5. If both target and source are arrays, **replace the target array entirely with the source array** (they are not concatenated).
6. Otherwise, use the source value if it is not `undefined`; if it is `undefined`, use the target value. **`defineBaseMetaTags` / `definePageMetaTags` (`define.ts`):**

- `defineBaseMetaTags(obj)` is a lightweight helper that simply returns `{ baseMetaTags: Object.freeze(obj) }`.
- `definePageMetaTags(obj)` is a lightweight helper that simply returns `{ pageMetaTags: Object.freeze(obj) }` .
- You can achieve the same result without using them by manually writing `return { baseMetaTags: Object.freeze<MetaTagsProps>({ ... }) }`.

**v5 CHANGELOG Excerpt (for Migration Guide):**

```md
## 5.0.0

### Major Changes

- feat: update `schema-dts` to v2
`schema-dts` (the package providing types for the JsonLd `schema` prop) has been updated from v1 to v2.
Runtime behavior for JsonLd remains unchanged. Breaking changes at the type level include:
- If your app has a direct dependency on `schema-dts`, you must update it to `^2.0.0`. Mixing v1 and v2
can cause TypeScript "Excessive stack depth" errors. 
- `schema-dts` v2 itself contains breaking type changes (e.g., making `Role` non-recursive,
promoting `Quantity` to a core DataType, and renaming exports for types that do not
comply with schema.org). 
- `schema-dts` v2 depends on `schema-dts-lib` and requires `typescript >=4.9.5` as a peer dependency. 
In environments with `strict-peer-dependencies=true`, you may need to explicitly add
`typescript` as a dependency.
``` ```

---

### Task 1: Create a new "Utilities" group and expand documentation for `deepMerge` and `define` functions

**Files:**

- Create: `docs/content/utilities/meta.$.ts`
- Move & Rewrite: `docs/content/deep-merge-function.md` → `docs/content/utilities/deep-merge.md`
- Create: `docs/content/utilities/define-meta-tags.md`
- Move & Rewrite: `docs/content/ja/deep-merge-function.md` → `docs/content/ja/utilities/deep-merge.md`
- Create: `docs/content/ja/utilities/define-meta-tags.md`

**Interfaces:**

- Input: The `deepMerge` and `define` sections from the "Reference: Exact Implementation Specifications" mentioned above.
- Output: A `Utilities` group (`/utilities/deep-merge`, `/utilities/define-meta-tags`). Link to these pages from the Usage page in Task 7.

``` - [ ] **Step 1: Create the group meta file**

`docs/content/utilities/meta.$.ts` (Labels are shared between English and Japanese; since function names like `deepMerge` and `define...` are identical across locales, `meta.$.ts` is sufficient):

```ts
import { defineMeta } from 'blume';

export default defineMeta({
title: 'Utilities',
order: 4
});
```

- [ ] **Step 2: Write the English version of `deep-merge.md`**

Create `docs/content/utilities/deep-merge.md` with the following content (since `docs/content/utilities/` was created in Step 1, move the file using `git mv` before rewriting it):

```bash
git mv docs/content/deep-merge-function.md docs/content/utilities/deep-merge.md
```

Structure the entire file as follows (you can remove `sidebar.order` from the frontmatter; the order within the group does not depend on the file arrangement in `meta.$.ts`, so add `order: 1` if you wish to specify it explicitly):

````md
---
title: Deep Merge
sidebar:
order: 1
---

`deepMerge(target, source)` deeply merges two `MetaTagsProps`-shaped objects. Use it to override a layout's default meta tags with page-specific values, as in the following example.

## Merge rules

`deepMerge` applies these rules per property, in order:

1. If `target` or `source` is `null`/`undefined`, the other one is returned as-is (or `{}` if both are missing).
2. If the **target** value is a `Date` instance or a function, the target value wins — the source value is ignored, even if it's also a `Date`/function.
3. Otherwise, if the **source** value is a `Date` instance or a function, the source value wins.
4. If both values ​​are non-null objects that aren't arrays — this includes class instances other than `Date`, not just plain object literals — they're merged recursively.
5. If both values ​​are arrays, the **source array replaces the target array entirely** — arrays are never concatenated.
6. Otherwise, the source value is used unless it's `undefined`, in which case the target value is kept.

```ts
import { deepMerge } from 'svelte-meta-tags';

const target = { 
title: 'Default Title', 
description: 'Default Description', 
openGraph: { images: [{ url: 'https://example.com/default.jpg' }] }
};

const source = { 
title: undefined, 
description: 'Page Description', 
openGraph: { images: [{ url: 'https://example.com/page.jpg' }] }
};

deepMerge(target, source);
// => {
// title: 'Default Title', // undefined source keeps target
// description: 'Page Description', // source wins
// openGraph: { images: [{ url: 'https://example.com/page.jpg' }] } // array replaced, not concatenated
// }
````

## +layout.svelte

```svelte
<script> 
import { page } from '$app/state'; 
import { MetaTags, deepMerge