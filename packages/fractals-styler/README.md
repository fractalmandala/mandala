# fractals-styler

JIT numeric utility classes, mobile-first breakpoint variants, themeable SASS tokens, and clean layout primitives — drop into any SvelteKit (or Vite) + SASS project.

## Install

```sh
pnpm add fractals-styler
```

## 1. Scaffold the static SASS files

```sh
npx fractals-styler init            # writes to src/lib/styles by default
npx fractals-styler init src/styles # or a custom destination
```

This copies the standard 6-file system scaffold into your project:

- `_tokens.sass` — color-only CSS custom properties & theme switching (`[data-theme="light"|"dark"]`)
- `_typography.sass` — `--text-*` scale + `.text-*`, `.tt-*`, `.w*`, `.bold`, `.lh*`
- `_fonts.sass` — 5 bundled offline `.woff2` font families (`Google Sans Flex`, `Mona Sans`, `Funnel Sans`, `JetBrains Mono`, `Familjen Grotesk`)
- `_globals.sass` — box-sizing reset, html/body defaults, scrollbar styling
- `_primitives.sass` — `.box`, `.row`, `.grid`, layout alignment modifiers & strict radius tokens (`radius2`..`radiusfull`)
- `_buttonslinks.sass` — baseline control & button classes (`.button`, `.button-primary`, `.button-quiet`, `.icon-button`, `.link`, `.control`)
- `_mixins.sass` — `+bp-sm` / `+bp-md` / `+bp-lg` / `+bp-xl` mobile-first media query mixins
- `index.sass` — `@use`s the files above in cascade order

Import once, globally (e.g. root `+layout.svelte`):

```sass
@import '$lib/styles/index.sass'
```

## 2. Add the Vite plugin

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import fractalsStyler from 'fractals-styler';

export default {
	plugins: [
		sveltekit(),
		fractalsStyler({
			unit: 'px' // 'px' (default) or 'rem'
		})
	]
};
```

Import the generated stylesheet once, globally:

```ts
import 'virtual:fractals-styler.css';
```

## Utility classes

Any `{prefix}{N}` for any non-negative integer `N`:

| Class | CSS |
|---|---|
| `.gapN` | `gap: Npx` |
| `.cgapN` | `column-gap: Npx` |
| `.rgapN` | `row-gap: Npx` |
| `.padN` | `padding: Npx` |
| `.padtopN` / `.padbotN` | `padding-top: Npx` / `padding-bottom: Npx` |
| `.padleftN` / `.padrightN` | `padding-left: Npx` / `padding-right: Npx` |
| `.marginN` | `margin: Npx` |
| `.margintopN` / `.marginbotN` | `margin-top: Npx` / `margin-bottom: Npx` |
| `.marginleftN` / `.marginrightN` | `margin-left: Npx` / `margin-right: Npx` |
| `.widthN` / `.heightN` | `width: Npx` / `height: Npx` |
| `.minwN` / `.maxwN` | `min-width: Npx` / `max-width: Npx` |
| `.minhN` / `.maxhN` | `min-height: Npx` / `max-height: Npx` |

*(Pass `unit: 'rem'` in `fractalsStyler()` options to emit rem values like `1rem` for `16`).*

## Radius Tokens

Strict radius token classes for visual consistency:
- `.radius2` (2px), `.radius4` (4px), `.radius8` (8px), `.radius12` (12px), `.radius16` (16px), `.radiusfull` (9999px pill/avatar).

## Breakpoint suffixes (Mobile-First)

Append `-sm` / `-md` / `-lg` / `-xl` to any utility class to apply it at a breakpoint:

| Suffix | Media query |
|---|---|
| `-sm` | `(min-width: 640px)` |
| `-md` | `(min-width: 768px)` |
| `-lg` | `(min-width: 1024px)` |
| `-xl` | `(min-width: 1280px)` |

e.g. `class="pad24 pad8-sm box row-md text-lg"`.

## Tailwind Conversion Cheat-Sheet

| Tailwind Class | fractals-styler Equivalent | Notes |
|---|---|---|
| `flex flex-col` | `box` | Column flex layout |
| `flex flex-row` | `row` | Row flex layout |
| `grid` | `grid` | Grid container |
| `grid-cols-2` | `grid-cols-2` | 2-column grid |
| `grid-cols-3` | `grid-cols-3` | 3-column grid |
| `items-center` | `xcenter` (in box) / `ycenter` (in row) | Cross-axis centering |
| `items-start` | `xleft` (in box) / `ytop` (in row) | Cross-axis start |
| `items-end` | `xright` (in box) / `ybot` (in row) | Cross-axis end |
| `justify-center` | `ycenter` (in box) / `xcenter` (in row) | Main-axis centering |
| `justify-between` | `xbetween` (in row) | Main-axis space-between |
| `flex-wrap` | `wrap` | Flex wrap |
| `flex-1` / `grow` | `grow` | Flex grow 1 |
| `shrink-0` | `shrink-0` | Flex shrink 0 |
| `w-full` | `w100` or `wfull` | 100% width |
| `h-full` | `h100` or `hfull` | 100% height |
| `min-w-0` | `min-w-0` | Prevent flex item blowout |
| `p-4` (16px) | `pad16` | Padding 16px |
| `gap-2` (8px) | `gap8` | Gap 8px |
| `rounded-md` | `radius6` or `radius8` | Border radius |
| `rounded-full` | `radiusfull` | Pill / avatar radius |
| `border` | `bdr` | 1px border (`var(--border)`) |
| `text-sm` | `text-sm` | Small font size |
| `text-lg` | `text-lg` | Large font size |
| `font-bold` | `bold` | Bold weight |


---

## CUBE CSS mapping

fractals-styler follows [CUBE CSS](https://cube.fyi/) (Composition · Utility · Block · Exception) — it works *with* the cascade instead of against it, and there is **no BEM** (`block__element--modifier`) anywhere.

| CUBE layer | What it is here | Where |
|---|---|---|
| **Composition** | Named, token-driven layout skeletons — the app shell + `.stack` / `.cluster` / `.with-sidebar` / `.reel`, plus the `.ambient` background. Arrangement only, no colour. | `_compositions.sass`, `<AppShell>` |
| **Utility** | Single-job classes: JIT numeric spacing/sizing (`padN`, `gapN`, `widthN`…), the type scale (`text-*`, `w*`, `bold`), radius tokens. | JIT plugin + `_typography.sass` |
| **Block** | The few genuine components — buttons, links, controls, `.panel`. | `_buttonslinks.sass`, `_primitives.sass` |
| **Exception** | State variants — prefer `data-*` / `aria-*` attributes over new classes: `[data-mobile-open="true"]`, `[aria-current="page"]`, `[data-state="active"]`. | markup + `_compositions.sass` |

## App-shell layout (Composition)

A canonical docs shell, driven entirely by layout tokens:

```
section.appshell
  header.appheader          height: var(--header-height)   /* 80px */
  main.appbody              display: grid
    aside.sidebarleft       nav / accordion
    article.bodymain        reading column (--body-min → --body-max)
    aside.sidebarright      table of contents
  footer.appfooter
```

- **`< 1025px`** — single column; `.sidebarleft` becomes an off-canvas drawer (open via `[data-mobile-open="true"]` on `.appbody`), `.sidebarright` is hidden.
- **`≥ 1025px`** — `clamp(200px, 20vw, 320px)` rails either side of a fluid middle; `.bodymain` content grows `clamp(600px, 58vw, 720px)`, centred. Both rails are sticky, `height: calc(100vh - var(--header-height))`, and scroll independently.
- Absent a rail, add `.no-left` / `.no-right` / `.no-both` to `.appbody` to collapse the grid.

### Layout tokens (`_tokens.sass`)

```
--header-height  --footer-height  --shell-pad  --layout-max
--sidebar-min (200px)  --sidebar-max (320px)
--body-min (600px)     --body-max (720px)
--ambient-blur  --ambient-{1,2,3}-bg  --ambient-{1,2,3}-op   /* themed light/dark */
```

## `<AppShell>` component

```svelte
<script>
	import { AppShell, toc } from 'fractals-styler/lib';
	let mobileOpen = $state(false);
</script>

<AppShell bind:mobileOpen>
	{#snippet header(nav)}
		<button onclick={nav.toggle}>menu</button>
		<!-- logo, search, theme toggle… -->
	{/snippet}
	{#snippet sidebarleft()} <!-- nav / accordion --> {/snippet}
	{#snippet sidebarright()} <!-- toc.items --> {/snippet}
	{#snippet footer()} <!-- copyright --> {/snippet}

	<!-- default slot = .bodymain page content -->
</AppShell>
```

`header` receives `nav = { open, toggle, close }`. Pass `ambient={false}` to drop the background, or `showLeft` / `showRight` to force a rail on/off (defaults follow snippet presence — e.g. `showRight={toc.items.length > 0}`).

## Shared TOC store

One reactive source for the on-this-page nav, so the right rail can live in the layout while pages just register their headings:

```svelte
<!-- a post page -->
<script>
	import { toc } from 'fractals-styler/lib';
	let article = $state(null);
	$effect(() => {
		if (!article) return;
		toc.setHeadings(article);          // slugs h2/h3 in place, publishes items
		const stop = toc.observe(article); // scroll-spy → toc.activeId
		return () => { stop(); toc.clear(); };
	});
</script>

<div bind:this={article}><Content /></div>
```

`toc.items` (`{ id, text, level }[]`), `toc.activeId`, and `toc.goTo(id)` are read by the layout's `sidebarright` snippet.
