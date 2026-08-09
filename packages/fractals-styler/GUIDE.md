# Installation & Usage Guide

Step-by-step walkthrough for wiring `fractals-styler` into a SvelteKit + SASS project — new or existing. For the full class/API reference see [README.md](./README.md).

## Prerequisites

- A Vite-based project (SvelteKit is the primary target, but the plugin itself is framework-agnostic).
- `sass` installed for `.sass` support:

  ```sh
  pnpm add -D sass
  ```

## Where does `fractals-styler` actually come from?

This package is **not published to npm** — `pnpm add fractals-styler` / `pnpm dlx fractals-styler` will 404 against the registry as-is. Pick the option that matches where you're installing it:

| Where | How to install | Notes |
|---|---|---|
| **A.** Inside this monorepo (`/Users/amrit/fractals`) | `pnpm add fractals-styler --filter <your-package>` | pnpm auto-links it via the `packages/*` workspace glob in `pnpm-workspace.yaml` — no publish needed. |
| **B.** A separate project on disk, this monorepo checked out locally | `pnpm add /Users/amrit/fractals/packages/fractals-styler` | pnpm records it as a `link:` dependency and symlinks it; rerun `pnpm --filter fractals-styler build` after changes — the symlink picks up the rebuilt `dist/` automatically, no reinstall needed. |
| **C.** Any project, anywhere, no shared disk | `npm publish` this package first (to npm or a private registry), then `pnpm add fractals-styler` normally | The only option that matches "drop into any new or existing project" literally — see below. |

### Publishing it (option C)

From `packages/fractals-styler`:

```sh
pnpm build
npm publish            # or: npm publish --access public, if scoping it e.g. @yourorg/fractals-styler
```

Bump `version` in `package.json` per release. Once published, every command in this guide using `pnpm add fractals-styler` / `pnpm dlx fractals-styler` works in any project as written.

### Trying it without publishing (option A or B)

```sh
pnpm pack                                   # produces fractals-styler-0.1.0.tgz
pnpm add /path/to/fractals-styler-0.1.0.tgz # in the target project
```

This is the closest stand-in for a real registry install if you want to test the actual installed-from-tarball experience before publishing.

## A. New SvelteKit project (monorepo-local, option A/B above)

```sh
pnpm create svelte@latest my-app
cd my-app
pnpm install
pnpm add -D sass
pnpm add /Users/amrit/fractals/packages/fractals-styler   # option B; use --filter form if inside the monorepo
```

Then follow steps 1–4 below.

## B. Existing SvelteKit project

```sh
pnpm add -D sass
pnpm add fractals-styler   # once published (option C) — otherwise use the file: path from above
```

Then follow steps 1–4 below — nothing here assumes a clean project; `init` only writes files at the destination you give it and skips anything already there.

---

## Step 1 — Scaffold the SASS files

Once installed (any option above), run the CLI with whichever invocation matches your package manager and install method:

```sh
pnpm dlx fractals-styler init        # works once published (option C)
# or, if installed locally as a dependency already:
pnpm exec fractals-styler init
# or, directly against a local checkout without installing at all:
node /Users/amrit/fractals/packages/fractals-styler/dist/cli.js init
```

Defaults to `src/lib/styles`. Pass a different path if you keep styles elsewhere:

```sh
pnpm exec fractals-styler init src/lib/styles/system
```

If a file already exists at the destination, `init` skips it and tells you. Pass `--force` to overwrite (careful — this clobbers any edits you've made to the scaffolded files):

```sh
pnpm exec fractals-styler init --force
```

You should now have:

```
src/lib/styles/
├── _tokens.sass
├── _typography.sass
├── _globals.sass
├── _primitives.sass
├── _mixins.sass
└── index.sass
```

These are plain files in your repo now — edit `_tokens.sass` to set your own brand colors, add to `_primitives.sass`, etc. `fractals-styler` will not touch them again unless you re-run `init --force`.

## Step 2 — Wire up the Vite plugin

Edit `vite.config.ts`:

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fractalsStyler from 'fractals-styler';

export default defineConfig({
	plugins: [sveltekit(), fractalsStyler()]
});
```

If your source lives somewhere other than `src/`, or you want to limit/extend which files get scanned for class usage, pass `content`:

```ts
fractalsStyler({
	content: ['src/**/*.{svelte,html,js,ts,jsx,tsx}', 'src/lib/**/*.svelte']
});
```

## Step 3 — Import the stylesheets globally, once

In your root layout (`src/routes/+layout.svelte`):

```svelte
<script>
	import '$lib/styles/index.sass';
	import 'virtual:fractals-styler.css';
</script>

<slot />
```

Order matters a little: importing `index.sass` first means your static tokens/typography/globals/primitives load before the JIT-generated utility overrides, so a numeric utility like `.pad24` will always win over a primitive default if both apply to the same element.

## Step 4 — Run it

```sh
pnpm dev
```

Open any component and start using classes:

```svelte
<div class="box gap16 pad24 text-lg w600">
	<div class="row gap8 padtop12-sm">
		<button class="blank">Click</button>
	</div>
</div>
```

Save the file — the dev server does a full reload that re-scans for class usage and regenerates `virtual:fractals-styler.css` with anything new.

For production, `pnpm build` triggers the same scan once at build time and bundles only the CSS your code actually uses.

---

## Common usage patterns

**Arbitrary spacing, no class list to maintain:**

```svelte
<div class="pad7 margintop3 gap19 width240 height88">
```

**Responsive variant of a utility (breakpoint suffix):**

```svelte
<div class="pad32 pad8-xs box-lg row-sm">
```

`pad8-xs` only applies the `8px` padding at `≤720px`; outside that range `pad32` (unsuffixed) still applies normally since CSS specificity/order isn't in play — both are separate classes, so combine them deliberately if you want a mobile override:

```svelte
<div class="pad32 pad8-xs">
```

At `≤720px` both rules apply; since `pad8-xs` is declared after the base utilities in the generated stylesheet, it wins. (If you need to be certain about ordering, check the generated `virtual:fractals-styler.css` in your dev tools — base rules first, then breakpoint blocks in `xs, sm, bs, lg, xl` order.)

**Dynamic `--pxN` variables in inline styles or your own SASS:**

```svelte
<div style="gap: var(--px12); padding: var(--px3) var(--px24)">
```

```sass
.card
	gap: var(--px12)
```

**Theming with the token system:**

```sass
// src/lib/styles/_tokens.sass — edit defaults
:root
	--background10: #ffffff
	--foreground10: #111111

// add a scoped theme anywhere in your sass
.theme-dark
	--background10: #0b0b0b
	--foreground10: #f5f5f5
```

```svelte
<div class="theme-dark box pad24" style="background: var(--background10); color: var(--foreground10)">
```

**Breakpoint-scoping your own custom classes** (the JIT can't introspect classes it didn't define — use the mixin instead):

```sass
@use '../lib/styles/mixins' as bp

.hero
	padding: 64px
	+bp.bp-sm
		padding: 24px
```

(Adjust the relative `@use` path to wherever you scaffolded `_mixins.sass`.)

---

## Troubleshooting

**`virtual:fractals-styler.css` 404s / "Failed to resolve import"**
Make sure `fractalsStyler()` is in your `vite.config.ts` plugins array — the virtual module only resolves while the plugin is active.

**New classes I just typed aren't showing up in dev**
The plugin reloads on file save; if you're seeing stale CSS, check that the file you're editing matches the `content` globs passed to `fractalsStyler()` (default: `src/**/*.{svelte,html,js,ts,jsx,tsx,mjs}`).

**A class like `card-sm` does nothing**
Breakpoint suffixes only resolve against classes the package itself defines (the numeric utilities, `.box`/`.row`/`.grid`/`.bdr`, and the `_typography.sass` classes). For your own classes, use the `_mixins.sass` `+bp-*` mixins instead — see above.

**Sass build errors after `init`**
Confirm `sass` is installed (`pnpm add -D sass`) and that your `@import`/`@use` path in the layout points at wherever you ran `init` (default `$lib/styles/index.sass`).

---

## App-shell docs layout (Composition layer)

`init` also scaffolds `_compositions.sass` — the CUBE **Composition** layer: a canonical docs shell (`.appshell / .appheader / .appbody / .sidebarleft / .bodymain / .sidebarright / .appfooter`), layout primitives (`.stack`, `.cluster`, `.with-sidebar`, `.reel`), and a theme-aware `.ambient` background.

For turnkey use, import the component instead of hand-writing the skeleton:

```svelte
<script>
	import { AppShell, toc } from 'fractals-styler/lib';
	let mobileOpen = $state(false);
</script>

<AppShell bind:mobileOpen>
	{#snippet header(nav)}…{/snippet}
	{#snippet sidebarleft()}…{/snippet}
	{#snippet sidebarright()}…{/snippet}
	{#snippet footer()}…{/snippet}
	<!-- page content -->
</AppShell>
```

Pages register their headings with the shared `toc` store; the layout renders `toc.items` in the right rail. See the **CUBE CSS mapping**, **App-shell layout**, **`<AppShell>` component**, and **Shared TOC store** sections of [README.md](./README.md) for the full API and layout tokens.
