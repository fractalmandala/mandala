# svelte-animated-icon — architecture & site reference

A tree-shakeable, multi-library animated-icon system for Svelte 5. Consumers import only the icons they use, from whichever icon library they want. Animations run on the native Web Animations API (WAAPI) — no animation-library dependency.

This file is the canonical reference for how the package and its docs site are wired. It reflects the **current** code, not a plan.

---

## Architecture

### Multi-library structure via subpath exports

```
svelte-animated-icon            ← core: AnimatedIcon, templates, types
svelte-animated-icon/phosphor   ← import { Gear } from 'svelte-animated-icon/phosphor'   (live, ~1500 icons)
svelte-animated-icon/remix      ← configured in codegen, not yet generated
```

Each icon library is a separate entry point in `package.json` → `exports`, so consumers only pull in the libraries they import.

**Current `exports` map** (points at `dist/`, produced by `svelte-package`):

```json
{
  ".":          { "types": "./dist/index.d.ts",          "svelte": "./dist/index.js" },
  "./phosphor": { "types": "./dist/phosphor/index.d.ts", "svelte": "./dist/phosphor/index.js" }
}
```

A `./remix` entry gets added once Remix icons are generated.

### Directory layout (actual)

```
packages/svelte-animated-icon/
├── package.json                  ← exports map, scripts, peerDeps (svelte ^5)
├── svelte.config.js              ← vitePreprocess + mdsvex, adapter-vercel, extensions
├── vite.config.ts                ← sveltekit() plugin
├── tsconfig.json                 ← extends ./.svelte-kit/tsconfig.json
├── scripts/
│   └── generate.js               ← config-driven codegen (any icon set)
├── static/
│   ├── svg/
│   │   ├── phosphor-regular/     ← codegen source SVGs
│   │   ├── phosphor-light/
│   │   ├── phosphor-fill/
│   │   ├── remixicons-line/
│   │   └── remixicons-fill/
│   ├── fonts/ · images/ · favicon.svg
├── src/
│   ├── lib/
│   │   ├── core/
│   │   │   ├── AnimatedIcon.svelte      ← shared animation component (takes an `svg` string)
│   │   │   ├── templates.svelte.ts      ← 20+ WAAPI templates, getTemplate, clearProps
│   │   │   └── index.svelte.ts          ← core barrel
│   │   ├── phosphor/
│   │   │   ├── icons/*.svelte           ← ~1500 generated components (embed regular/light/fill SVG)
│   │   │   └── index.ts                 ← generated barrel: export { default as Gear } from …
│   │   ├── remix/
│   │   │   └── index.ts                 ← placeholder barrel (no icons generated yet)
│   │   ├── utils/localpulls.ts          ← docs loader (import.meta.glob over routes/docs)
│   │   ├── styles/                      ← site SASS design system (index.sass + partials)
│   │   ├── data/site-config.md          ← this file
│   │   ├── assets/ · index.ts           ← package entry: re-exports core
│   └── routes/                          ← the docs site (see "Docs site")
└── README.md
```

---

## Core

### `AnimatedIcon.svelte`

The shared animation component. Unlike the per-icon wrappers, it takes the **inner SVG markup as a string** via `svg` (no fetching, no `<svg>` wrapper) and renders it inside a fixed `viewBox="0 0 256 256"`.

Props (`Props` is exported from the component's `module` block):

| Prop | Type | Default | Notes |
|---|---|---|---|
| `svg` (required) | `string` | — | pre-stripped inner SVG content |
| `template` | `string` | `'draw'` | a template id (see `TEMPLATE_IDS`) |
| `size` | `number` | `24` | px |
| `trigger` | `'hover' \| 'mount' \| 'controlled'` | `'hover'` | how the animation fires |
| `active` | `boolean` | `false` | drives animation when `trigger="controlled"` |
| `loop` | `boolean` | `false` | force the template to repeat forever |
| `speed` | `number` | `1` | duration/delay multiplier (`2` = 2× faster) |
| `easing` | `string \| null` | `null` | override the template's easing; `null` keeps its own |
| `class` | `string` | `''` | extra class on the wrapper |

Exposes `startAnimation()` / `stopAnimation()` for imperative control via `bind:this`. Switching `trigger` away from `controlled` cancels any in-flight (looping) animation via the effect cleanup.

### `templates.svelte.ts`

- `IconTemplate` — `{ id: string; label: string; for?: 'line' | 'fill' }`. `for` marks stroke-only (line) or fill-only templates.
- `TEMPLATES: IconTemplate[]` — 20+ WAAPI templates (`draw`, `cascade`, `pop`, `spin`, `jelly`, `orbit`, `assemble`, `trace`, `tada`, `flip`, `swing`, `wave`, `march`, `boil`, `glitch`, `native-draw`, `wipe`, `rise`, `iris`, `split`, `drop`, `stamp`, …).
- `TEMPLATE_IDS` — array of template ids.
- `getTemplate(id)` — resolve a template; `clearProps(svgEl)` — reset inline animation props.

### Core exports

- `src/lib/core/index.svelte.ts` → `AnimatedIcon`, `TEMPLATES`, `TEMPLATE_IDS`, `getTemplate`, `clearProps`, and types `AnimatedIconProps`, `IconTemplate`.
- `src/lib/index.ts` re-exports the above as the package's main (`.`) entry. Icon sets are reached only via the subpath (`/phosphor`).

---

## Per-icon components

Each generated icon is a thin wrapper that embeds its variants and forwards everything else to `AnimatedIcon`:

```svelte
<!-- Acorn.svelte (auto-generated) -->
<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS = {
		regular: `<path d="M216,112v16c0,53-88,88-88,112…" fill="none" stroke="currentColor" …/>`,
		light:   `<path d="…" stroke-width="12"/>`,
		fill:    `<path d="M232,104a56.06,56.06,0,0,0-56-56…"/>`
	};

	type Variant = keyof typeof VARIANTS;

	interface Props {
		variant?: Variant;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant]} {...rest} />
```

Because `...rest` flows straight into `AnimatedIcon`, every icon accepts `template`, `size`, `trigger`, `active`, `loop`, `speed`, `easing`, and `class` in addition to `variant`. `currentColor` makes the icon inherit text color.

---

## Consumer usage

```svelte
<script>
	import { Gear, Heart, ArrowRight } from 'svelte-animated-icon/phosphor';
	import { AnimatedIcon, TEMPLATE_IDS } from 'svelte-animated-icon';
</script>

<Gear template="spin" trigger="hover" size={24} />
<Heart template="jelly" trigger="mount" size={32} variant="fill" />
<ArrowRight template="draw" trigger="controlled" active={isHovered} />
<Gear template="native-draw" variant="light" size={20} />

<!-- core directly, for custom SVG -->
<AnimatedIcon svg={`<circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-width="16"/>`} template="spin" />
```

### Tree-shaking

`import { Gear } from 'svelte-animated-icon/phosphor'` resolves to `dist/phosphor/icons/Gear.svelte`, which imports only `dist/core/AnimatedIcon.svelte` + the templates module. The other ~1500 icons are eliminated. Never importing `/remix` keeps that set out entirely. (The docs site's `/` route imports the whole barrel on purpose, to show every icon — that page opts out of tree-shaking.)

---

## Codegen — `scripts/generate.js`

Config-driven; one `SETS` entry per icon library. Current config:

```js
const SETS = [
  {
    name: 'phosphor',
    variants: { regular: 'static/svg/phosphor-regular', light: 'static/svg/phosphor-light', fill: 'static/svg/phosphor-fill' },
    defaultVariant: 'regular',
    nameFromFile: (filename, variant) => filename.replace('.svg', '').replace(`-${variant}`, ''),
    stripSuffix: { fill: '-fill', light: '' }
  },
  {
    name: 'remix',
    variants: { fill: 'static/svg/remixicons-fill', line: 'static/svg/remixicons-line' },
    defaultVariant: 'line',
    nameFromFile: (filename, variant) => filename.replace('.svg', '').replace(`-${variant}`, ''),
    stripSuffix: {}
  }
];
```

For each set it: reads SVGs from each variant dir → matches icons by name → strips the `<svg>` wrapper and bounding `<rect fill="none">` → writes `src/lib/{set}/icons/{PascalName}.svelte` (with `$props()`) → writes `src/lib/{set}/index.ts` barrel.

Run with `node scripts/generate.js`. To add a library, drop its SVGs under `static/svg/…` and add a `SETS` entry.

---

## Build, config & publish

- **Scripts** (`package.json`): `dev` (vite dev), `build`, `preview`, `check` / `check:watch` (svelte-kit sync + svelte-check), `prepare` / `prepack` (svelte-kit sync + `svelte-package` + `publint`), `lint`, `format`. Codegen is a separate `node scripts/generate.js`.
- **`svelte.config.js`**: `preprocess: [vitePreprocess(), mdsvex({ extensions: ['.md'] })]`, `extensions: ['.svelte', '.md', '.svx']`, `kit.adapter: adapter-vercel({ runtime: 'nodejs24.x' })`. (Library packaging uses `@sveltejs/package`; the adapter is for deploying the docs site.)
- **Publishing**: `svelte-package` emits `dist/` matching the `exports` map; `files: ["dist", …]` ships only that. `publint` validates it.

---

## Docs site (`src/routes`)

The site itself is a SvelteKit app that documents the library.

- **Docs are `.md` files in `src/routes/docs/`**, compiled by mdsvex (enabled via `svelte.config.js`).
- Each doc carries frontmatter:
  ```
  ---
  title: …
  id: <number>
  description: …
  group: …
  ---
  ```
- **`utils/localpulls.ts → allDocs(group)`** globs `src/routes/docs/*.md`, reads each doc's `metadata`, filters by `group`, and sorts by numeric `id` ascending. `+layout.ts` calls it per group (e.g. `allDocs('getting started')`, `allDocs('customization')`) to build the sidebar.
- `+layout.svelte` renders the sidebar from that data and `{@render children()}` for the active doc; types its props with `LayoutProps` from `./$types`.
- The home route `/` is the interactive icon explorer (search, variant/template/size/speed/trigger/loop controls + a live preview grid).
- Doc groups are documented separately in the docs plan; each new group needs a matching `allDocs('…')` load and a nav section.

---

## Sources & licenses

**[Phosphor Icons](https://phosphoricons.com/)** — MIT. Permission is granted, free of charge, to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies, provided the copyright + permission notice is included.

**[Remix Icons](https://remixicon.com/)** — free for personal and commercial use: websites, apps, software, templates, UI kits, presentations; modify/adapt/integrate; distribute as part of a larger product (icons not the main value); crediting Remix Icon is optional but appreciated.
