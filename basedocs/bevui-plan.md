# Orchestration Plan: beUI for Svelte 5 / SvelteKit (`@beui/svelte`)

> **Revision 3** — assessed and rewritten under the **Svelte Boss** (active, port lane)
> with **Design Boss** supervision (tokens, accessibility, motion) and **Code Boss**
> handoffs (tests, CI, release gates). Revision 2 fixed a fatal dependency
> (`svelte-motion`) and a styling contract that contradicted the monorepo, but planned a
> hand-rolled motion layer. The user then surfaced **`@humanspeak/svelte-motion`**
> (motion.svelte.page) — an actively-maintained, Framer-Motion-parity library built on
> the official Motion core — so **D1 is revised again to adopt it**: beUI's
> `motion/react` code now ports nearly 1:1. See [§3 Decision Log](#3-decision-log-revision-1-→-3).

---

## 0. Executive Summary

This plan ports **beUI** — a spring-animated UI and AI-agent primitive library built
for React (`motion/react` + Tailwind) — to **Svelte 5 / SvelteKit** as a
single-repository **package + docs app** (`@beui/svelte`), mirroring the
`fractalsvelte` structure.

- **Source of truth:** beUI is a real, public library at **https://beui.dev**
  (GitHub: `starc007/ui-components`). Its shadcn-style registry
  (`https://beui.dev/r`, `https://beui.dev/r/registry.json`,
  `https://beui.dev/r/{slug}`) is the canonical inventory and the source we port
  from. **~60 components** across three categories: `motion` (components), `agents`
  (AI primitives), `blocks` (product widgets). Full inventory: [§5](#5-beui-source-inventory-and-port-tiers).
- **Boss routing:** **Svelte Boss** owns the implementation contract (runes,
  SvelteKit, indented SASS, port pipeline). **Design Boss** owns tokens, motion
  physics, WCAG 2.2 AA, and visual QA (consulted at every phase). **Code Boss** owns
  the test/QA/CI/release gates at handoff points.
- **Primary stack:** Svelte 5, SvelteKit, TypeScript strict, **indented SASS**,
  **`@humanspeak/svelte-motion`** (Framer-Motion-parity motion engine: `motion.<tag>`,
  `AnimatePresence`, gestures, variants, FLIP `layout`/`layoutId`),
  `@sveltejs/package`, pnpm.

### 1.1 What changed from Revision 1 (headlines)

| Concern | Revision 1 | Revision 2 |
| --- | --- | --- |
| Motion library | `svelte-motion` (`<Motion let:motion>`, `use:motion`, `layoutId`) | **`@humanspeak/svelte-motion`** (motion.svelte.page) — `motion.<tag>`, `AnimatePresence`, gestures, variants, FLIP `layout`/`layoutId`, springs, scroll hooks. beUI's `motion/react` code ports nearly 1:1. |
| Styling | Tailwind classes + `cn()` everywhere | **Indented SASS per component**, `data-slot` hooks, two-layer CSS tokens, zero `<style>` blocks, zero Tailwind. |
| Hover capability | `onMount` in `.svelte.ts` (broken) | `$state` + `$effect` with `$app/environment` browser guard. |
| Tabs | No keyboard support, no ARIA wiring | Roving `tabindex`, Arrow/Home/End keys, `role=tab/tablist/tabpanel`, `aria-controls`. |
| Registry | Ad-hoc JSON shape | shadcn **registry-item schema** (`registry:component`, `files[]`, `dependencies`, `raw`) + registry index endpoint. |
| Package exports | Wildcard `"./components/*"` (unsupported by `svelte-package`) | **Explicit per-component subpath exports** (fractalsvelte pattern), `files` allowlist, `sideEffects`, `publint`. |
| Testing / QA | None | Vitest + Testing Library, Playwright, a11y checks, visual QA (light/dark). |
| Inventory | 4 components | Full ~60-component tiered inventory ([§5](#5-beui-source-inventory-and-port-tiers)). |
| Reduced motion | Absent | Global `prefers-reduced-motion` policy + per-component overrides (Design Boss). |
| Tooling | `bun run`, Biome | `pnpm` scripts (monorepo convention), Prettier + ESLint (fractalsvelte parity), `publint`. |

---

## 2. Repository Architecture (Package + Docs in one)

`src/lib/` is the published package (`@sveltejs/package`); `src/routes/` is the docs
site and registry API server. This mirrors `packages/fractalsvelte`.

```text
beui-svelte/
├── package.json                  # pnpm scripts, explicit exports, peerDeps, files
├── svelte.config.js
├── vite.config.ts
├── playwright.config.ts
├── scripts/
│   ├── check-registry.ts         # validates every registry item resolves + typechecks
│   └── gen-registry.ts           # builds registry index from src/lib catalog
├── src/
│   ├── lib/                      # 📦 PUBLISHED PACKAGE ($lib → @beui/svelte)
│   │   ├── index.ts              # barrel
│   │   ├── ease.ts               # motion tokens (spring presets, easings)
│   │   ├── utils.ts              # type helpers + cn()→ null (no class merging)
│   │   ├── motion/               # 🌱 helpers only (see §6); engine is @humanspeak/svelte-motion
│   │   │   └── use-hover-capable.svelte.ts
│   │   ├── components/
│   │   │   ├── motion/           # Tier 1 primitives (button, tabs, switch, …)
│   │   │   ├── agents/           # Tier 2 AI primitives (prompt-input, message, …)
│   │   │   └── blocks/           # Tier 3 widgets (dynamic-island, otp-input, …)
│   │   ├── styles/
│   │   │   ├── index.sass        # @forward of every component .sass (single entry)
│   │   │   ├── _tokens.sass      # two-layer CSS variables (light + dark)
│   │   │   └── _mixins.sass      # +interactive, +focus-ring, +icon-child …
│   │   └── registry-server.ts    # catalog + per-item bundler (used by +server.ts)
│   └── routes/                   # 🌐 DOCS SITE + REGISTRY API
│       ├── +layout.svelte
│       ├── +page.svelte
│       ├── docs/[category]/[slug]/+page.svelte
│       └── r/
│           ├── registry.json/+server.ts    # registry index (shadcn shape)
│           └── [name].json/+server.ts      # single registry item
└── tests/                        # vitest unit + component tests
```

### 2.1 Why not a monorepo split?

Same reasoning as `fractalsvelte`: one repo keeps docs previews, registry sources, and
the package in lockstep; `svelte-package` only ships `src/lib`, while the docs app and
`/r/*` server routes stay in the repo. No cross-package versioning overhead.

---

## 3. Decision Log (Revision 1 → 2)

### D1 — Motion engine: adopt `@humanspeak/svelte-motion` (Revision 3)

**Why (Revised 3):** Revision 2 assumed no Framer-Motion-compatible library existed for
Svelte 5 (the official Motion ships only React/JS/Vue, and `svelte-motion` is an
unmaintained Svelte 3/4-era port) and planned a hand-rolled `flip` action. The user
then surfaced **`@humanspeak/svelte-motion`** (https://motion.svelte.page) — an
**actively maintained**, MIT-licensed, Framer-Motion-parity library for Svelte 5
built on the official Motion core (`motion` + `motion-dom`, both ^12.40.0, bumped in
lockstep with React framer-motion). v0.8.2 published 8 days ago; 676 unit + 290 E2E
tests pass.

**What it provides (verified against the docs + npm):**
- **170 `motion.<tag>` proxy components** — `motion.div`, `motion.button`,
  `motion.svg`, `motion.path`, … with `initial` / `animate` / `exit` / `transition`.
- **`AnimatePresence`** exit animations with `mode="sync"|"wait"|"popLayout"`,
  `onExitComplete`, plus clone-exit and owned real-node exit forms.
- **Gestures:** `whileHover` (true-hover gated), `whileTap` (keyboard-accessible),
  `whileFocus`, `whileInView`, and a full drag API.
- **Variants** (string keys, inheritance, function-form `custom`).
- **FLIP layout:** `layout` (single-element) and **shared `layoutId`** with
  `LayoutGroup` scoping + `layoutScroll`.
- **Hooks:** `useSpring`, `useScroll`, `useTransform`, `useReducedMotion`, and more.
- **SSR-safe** (initial rendered server-side; `initial={false}` avoids hydration
  flicker), runes-native, full TypeScript types, tree-shakable named components
  (`MotionDiv`, …).

**Decision:** `@humanspeak/svelte-motion` is a **peer dependency** of `@beui/svelte`
(^0.8.0). beUI's `motion/react` code ports **nearly 1:1** (`motion.div`, `layoutId`,
`AnimatePresence`, `whileTap`, variants), so the port becomes a mechanical translation
+ SASS restyle instead of reimplementing motion.

**Phase-0 verification gate:** the npm README for v0.8.x still says "Shared layout
(`layoutId`) is not implemented yet," while motion.svelte.page documents and demos it
(shared-layout-animation, LayoutGroup, layoutScroll). The docs site is authoritative;
Phase 0 must empirically verify `layoutId` + `AnimatePresence` + SSR hydration before
Tier-1 ports commit. If a specific `layoutId` scenario fails, fall back to `layout`
(single-element FLIP) or the clone-exit path — never to a hand-rolled engine.

**Residual risk:** pre-1.0 dependency (v0.8.x) — pin `^0.8.0`, re-verify on upgrade.

### D2 — Styling contract: indented SASS, no Tailwind, no `cn()`

**Why:** Revision 1 claimed the "fractalsvelte pattern" but shipped Tailwind classes
and `cn()` — a direct contradiction of the Svelte Boss contract
(`svelte-styling-patterns`: zero `<style>` blocks, indented SASS, single-tab, no
braces/semicolons; `port-component`: no class-string merging, `data-slot` hooks,
tokens only).

**Decision:** every component ships `<name>.svelte` (markup + runes only) and a
colocated `<name>.sass` keyed on `data-slot`, registered in
`src/lib/styles/index.sass`. Variants are typed props rendered as `data-*` attributes
the SASS nests on. Consumers can restyle anything through CSS custom properties
(semantic tokens), never through a class escape hatch.

### D3 — `useHoverCapable` fix (runes + SSR-safe)

`onMount` does not belong in a `.svelte.ts` module and SSR would throw on
`window.matchMedia`. Rewritten with `$state` + `$effect` + `$app/environment`.

### D4 — Registry endpoints emit the shadcn schema

Consumers use the shadcn CLI / registry tooling, so our `/r/*` responses must match
`registry:item` shape (`name`, `type: "registry:component"`, `dependencies`,
`registryDependencies`, `files[]` with `content`, `raw`). Index at
`/r/registry.json` lists every item. `check-registry.ts` validates the whole catalog.

### D5 — Explicit package exports

`svelte-package` does not support wildcard subpaths reliably. Use the explicit
per-component export map from the `fractalsvelte` package.json pattern, plus `files`,
`sideEffects: ["**/*.css", "**/*.sass"]`, and `publint` in `prepack`.

### D6 — pnpm, monorepo tooling

Replace `bun run`/Biome with `pnpm` scripts and Prettier + ESLint (fractalsvelte
parity). Add `vitest`, `@testing-library/svelte`, `jsdom`, and `@playwright/test`.

### D7 — A11y is a per-component gate, not an afterthought (Design Boss)

Every component must pass the §8 contract item 11 checklist (semantic element,
label/aria-label, visible focus ring, keyboard support, `aria-*` wiring, reduced-
motion path, hover-only features gated on `useHoverCapable()`). The a11y-architect
reviews each port before it leaves the phase.

### D8 — Tabs define the keyboard + ARIA pattern (used everywhere)

`role=tablist/tab/tabpanel`, roving `tabindex`, Arrow Left/Right to move, Home/End
jumps, `aria-selected` + `aria-controls` + `id` wiring. This pattern is the template
for radio groups, command palettes, and expandable tabs.

### D9 — Global reduced-motion policy

`prefers-reduced-motion: reduce` collapses all spring/transition durations via a
`--beui-motion-scale` token (§6.5); motion components use the library's
`useReducedMotion()` hook (springs jump instantly); the loader swaps transforms for a
calm opacity pulse. Design QA verifies this per component.

---

## 4. Package Configuration

### 4.1 `package.json` (key sections)

```jsonc
{
  "name": "@beui/svelte",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build && npm run prepack",
    "preview": "vite preview",
    "prepare": "svelte-kit sync || echo ''",
    "prepack": "svelte-kit sync && svelte-package && publint",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:registry": "pnpm exec tsx scripts/check-registry.ts",
    "lint": "prettier --check . && eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:visual": "playwright test --config playwright.visual.config.ts"
  },
  "files": ["dist", "!dist/**/*.test.*", "!dist/**/*.spec.*"],
  "sideEffects": ["**/*.css", "**/*.sass"],
  "svelte": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "svelte": "./dist/index.js", "default": "./dist/index.js" },
    "./styles": { "sass": "./dist/styles/index.sass", "default": "./dist/styles/index.sass" },
    "./ease": { "types": "./dist/ease.d.ts", "svelte": "./dist/ease.js", "default": "./dist/ease.js" },
    "./button": { "types": "./dist/components/motion/button/index.d.ts", "svelte": "./dist/components/motion/button/index.js", "default": "./dist/components/motion/button/index.js" }
    // …one explicit entry per component (fractalsvelte pattern), e.g. ./tabs, ./switch, ./prompt-input
  },
  "peerDependencies": {
    "@humanspeak/svelte-motion": "^0.8.0",
    "svelte": "^5.0.0"
  },
  "devDependencies": {
    "@humanspeak/svelte-motion": "^0.8.0",
    "@sveltejs/adapter-auto": "^4.0.0",
    "@sveltejs/kit": "^2.16.0",
    "@sveltejs/package": "^2.3.0",
    "@sveltejs/vite-plugin-svelte": "^5.0.0",
    "@playwright/test": "^1.50.0",
    "@testing-library/svelte": "^5.2.0",
    "eslint": "^9.0.0",
    "jsdom": "^26.0.0",
    "prettier": "^3.5.0",
    "prettier-plugin-svelte": "^3.3.0",
    "publint": "^0.3.0",
    "sass": "^1.83.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.1.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

> Note the deliberate absence of `tailwindcss`, `clsx`, `tailwind-merge`, the legacy
> unmaintained `svelte-motion` package, and any icon dependency (icons are consumer
> children). The motion engine is the peer dependency `@humanspeak/svelte-motion`.

### 4.2 `svelte.config.js`

```js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      '@': 'src/lib',
      '@beui/svelte': 'src/lib'
    }
  }
};
export default config;
```

### 4.3 `vite.config.ts` (test + SSR exclusions)

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    // sass + motion modules must be transformable by vitest without SSR traps
    server: { deps: { inline: ['svelte'] } }
  }
});
```

---

## 5. beUI Source Inventory and Port Tiers

Ported **from the live beUI registry** (`https://beui.dev/r`, category `motion` /
`agents` / `blocks`). Each item is fetched as JSON (`/r/{slug}`) for files + deps and
as raw source (`/r/{slug}/raw`) for conversion, exactly like the port-component
oracle pipeline. Tiers define sequencing, not quality.

### Tier 1 — Core motion primitives (Foundation → Phase 2)

| Slug | beUI component | Key motion | Port notes |
| --- | --- | --- | --- |
| `button` | Button + StatefulButton + MagneticButton | press spring, hover lift, ripple, blur-swap slots | Highest-value; defines the component contract. `ripple`/magnetic are bonus. |
| `tabs` | Tabs (pill/segment/underline) | shared-layout pill (`layoutId`) | Define keyboard + ARIA here (D8). |
| `switch` | Switch | spring thumb + press | Easy win. |
| `input` | Input | error shake, success check draw | Form base. |
| `checkbox` | Checkbox | draw-on check, indeterminate | Form base. |
| `radio` | Radio Group | gliding `layoutId` dot | Reuses `layoutId`. |
| `tooltip` | Tooltip | blur enter/exit, spring spawn | Floating + focus triggers. |
| `marquee` | Marquee | infinite scroll | Pure CSS + pause-on-hover. |
| `animated-badge` | Animated Badge | pulse + state icons | Small. |
| `text-animation` | Text primitives | spring reveals, shimmer | Reusable micro-block. |
| `number` | Number animation | count-up, ticker | Small. |
| `loader` | Loader (17 variants) | CSS + reduced-motion fallback | Big surface; late Tier 1. |

### Tier 2 — AI agent primitives (Phase 3)

`prompt-input`, `message`, `message-bubble`, `message-scroller`, `streaming-response`,
`code-block`, `citations`, `todo-list`, `tool-result`, `tool-approval`, `approval-card`,
`agent-activity`, `loading-states`, `file-diff`, `image-generation`, `ai-sidebar`.

> These are the **fractalsvelte `ai-elements` overlap zone** — reuse its rune patterns
> and check for component reuse before porting (e.g. fractalsvelte already has
> `prompt-input`, `message`, `code`, `sources`). Port only what beUI's motion makes
> distinct; document overlap in the per-port ledger.

### Tier 3 — Product blocks (Phase 4)

`dynamic-island`, `command-palette`, `otp-input`, `file-upload`, `notification-stack`,
`expandable-tabs`, `expandable-action-bar`, `overflow-actions`, `swipeable-list`,
`bloom-menu`, `feedback-widget`, `not-found`, `chat-app`, `morphing-modal`,
`center-morph-modal`, `bottom-sheet`, `drawer`, `bounce-sidebar`, `animated-sidebar`,
`preview-rail`, `dock`, `shared-layout-bg`, `action-swap`, `animated-toast-stack`,
`theme-toggle`, `bouncy-accordion`, `select`, `range-slider`, `pagination`-style
widgets, `infinite-masonry`, `availability-scheduler`, `swap`, `prediction-market`,
`wallet-card`, `fixtures` (knockout bracket), `scroll-animation` (Lenis),
`cylinder-carousel`, `shader-background`, `wheel-picker`, `table` (virtualized 10k).

**Stretch / explicit non-goals for v1:** `shader-background` (WebGL canvas),
`wheel-picker` (3D drum), `table` (virtualization dep), `cylinder-carousel`,
`scroll-animation` (Lenis). These are evaluated post-v1 behind the motion façade (D1
fallback) — never block the core release.

---

## 6. Motion Engine (`@humanspeak/svelte-motion`)

The motion engine is the peer dependency **`@humanspeak/svelte-motion`**
(https://motion.svelte.page, v0.8.2, MIT, actively published). It is a
Framer-Motion-parity library built on the official Motion core (`motion` +
`motion-dom`, both ^12.40.0, bumped in lockstep with React framer-motion): 170
`motion.<tag>` proxy components, `initial`/`animate`/`exit`/`transition`,
`AnimatePresence` exit animations (`mode="sync"|"wait"|"popLayout"`), gestures
(`whileHover`/`whileTap`/`whileFocus`/`whileInView`), variants, FLIP `layout` +
shared `layoutId` (with `LayoutGroup` scoping and `layoutScroll`), drag, springs,
scroll hooks, and SSR-safe rendering. beUI's `motion/react` source therefore ports
**nearly 1:1** — the port is a mechanical translation + SASS restyle.

### 6.1 Motion tokens — `src/lib/ease.ts` (transition presets)

Spring params map 1:1 from beUI React and are passed directly as `transition` values
on `motion.<tag>` components and `AnimatePresence`. Also export CSS easing strings
for the SASS token layer.

```ts
// src/lib/ease.ts
import type { MotionTransition } from '@humanspeak/svelte-motion';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

export const EASE_OUT_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Press feedback for buttons & interactive surfaces */
export const SPRING_PRESS: MotionTransition = { type: 'spring', stiffness: 500, damping: 30, mass: 0.6 };
/** Slot swaps (text/icon rolls) */
export const SPRING_SWAP: MotionTransition = { type: 'spring', stiffness: 460, damping: 30, mass: 0.55 };
/** Overlay panels & modals */
export const SPRING_PANEL: MotionTransition = { type: 'spring', stiffness: 420, damping: 40, mass: 0.5 };
/** Shared-layout glides (pills, tab triggers) — used with layout/layoutId */
export const SPRING_LAYOUT: MotionTransition = { type: 'spring', stiffness: 360, damping: 32, mass: 0.6 };
/** Cursor-follow physics (magnetic) */
export const SPRING_MOUSE: MotionTransition = { stiffness: 200, damping: 15, mass: 0.3 };
/** Sliders & drag handles */
export const SPRING_GLIDE: MotionTransition = { stiffness: 700, damping: 50, mass: 0.5 };
```

### 6.2 Canonical pattern — press feedback is a motion prop

beUI's `whileTap`/`whileHover` translate to the same prop names on `motion.<tag>`:

```svelte
<motion.button
  whileTap={{ scale: 0.96 }}
  whileHover={{ y: -1 }}
  transition={SPRING_PRESS}
  data-slot="button"
>
  {@render children?.()}
</motion.button>
```

`whileHover` is true-hover gated (`(hover: hover) and (pointer: fine)`), so the
`useHoverCapable()` helper is only needed for *CSS-side* gating, never for motion.

### 6.3 Shared layout (`layoutId`) — native, no FLIP engine to write

beUI's signature shared-layout moves (tab pill, radio dot, Dynamic Island shell,
dock pill) map to `layoutId` + `AnimatePresence`, exactly as in React:

```svelte
<AnimatePresence>
  {#if activeId === tab.id}
    <motion.span
      layoutId="beui-tab-indicator"
      transition={SPRING_LAYOUT}
      data-slot="tab-indicator"
    />
  {/if}
</AnimatePresence>
```

Wrap multiple tab strips / islands in `<LayoutGroup id="…">` to scope their shared
ids; mark scrollable parents with `layoutScroll`. Reduced motion jumps instantly via
`useReducedMotion()` (see §6.5). **Phase 0 verifies `layoutId` against the real
package** — the npm README lags the docs on this (see D1 gate).

### 6.4 `use-hover-capable.svelte.ts` — CSS-side gating only (D3)

```ts
// src/lib/motion/use-hover-capable.svelte.ts
import { browser } from '$app/environment';

/**
 * True when the device has a hover-capable primary pointer.
 * Use only for CSS-side gating (e.g. a data-* class that changes layout on hover).
 * Motion-side hover is handled natively by `whileHover`.
 * Call during component init only (rune reactivity requires a rune context).
 */
export function useHoverCapable() {
  let isHoverCapable = $state(false);

  $effect(() => {
    if (!browser) return;
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    isHoverCapable = mql.matches;
    const handler = (e: MediaQueryListEvent) => { isHoverCapable = e.matches; };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  });

  return { get current() { return isHoverCapable; } };
}
```

### 6.5 Reduced-motion policy (Design Boss)

Use the library's `useReducedMotion()` hook to zero springs/transitions on motion
components, plus the CSS token for CSS-side animation:

```svelte
<script lang="ts">
  import { useReducedMotion, motion } from '@humanspeak/svelte-motion';
  const reduce = useReducedMotion();
</script>
<motion.div
  animate={{ x: $reduce ? 0 : 120 }}
  transition={$reduce ? { duration: 0 } : SPRING_LAYOUT}
/>
```

```sass
// src/lib/styles/_tokens.sass
:root
	--beui-motion-scale: 1

@media (prefers-reduced-motion: reduce)
	--beui-motion-scale: 0
```

Every component that animates must include a reduced-motion path (hook for motion,
token for CSS). Design QA checks this per component (D9 checklist).

---

## 7. Design Tokens — Two-Layer CSS Variables

Two layers per `svelte-styling-patterns`: **primitive** (raw values) and **semantic**
(domain meaning). Component SASS consumes **semantic tokens only**. Token names reuse
the fractalsvelte vocabulary (`--primary`, `--background`, `--muted`, `--border`,
`--ring`, `--destructive`, `--card`, `--input`) so `@beui/svelte` composes cleanly
with fractalsvelte skins.

```sass
// src/lib/styles/_tokens.sass
// Layer 1 — primitives
:root
	--beui-gray-50: #fafafa
	--beui-gray-900: #171717
	--beui-blue-500: #3b82f6
	--beui-red-500: #ef4444
	--beui-emerald-500: #10b981
	--beui-space-1: 4px
	--beui-space-2: 8px
	--beui-space-3: 12px
	--beui-space-4: 16px
	--beui-radius-sm: 6px
	--beui-radius-md: 8px
	--beui-radius-lg: 12px
	--beui-radius-full: 9999px

// Layer 2 — semantic (light)
:root
	--background: var(--beui-gray-50)
	--foreground: var(--beui-gray-900)
	--primary: var(--beui-blue-500)
	--primary-foreground: #ffffff
	--muted: color-mix(in oklab, var(--beui-gray-900) 8%, transparent)
	--muted-foreground: color-mix(in oklab, var(--beui-gray-900) 55%, transparent)
	--border: color-mix(in oklab, var(--beui-gray-900) 14%, transparent)
	--ring: var(--beui-blue-500)
	--destructive: var(--beui-red-500)
	--card: #ffffff
	--input: var(--beui-gray-900)

// Layer 2 — semantic (dark)
.dark
	--background: var(--beui-gray-900)
	--foreground: #fafafa
	--primary: #60a5fa
	--primary-foreground: #171717
	--muted: color-mix(in oklab, #fafafa 10%, transparent)
	--muted-foreground: color-mix(in oklab, #fafafa 60%, transparent)
	--border: color-mix(in oklab, #fafafa 18%, transparent)
	--ring: #60a5fa
	--destructive: #f87171
	--card: #1e1e1e
	--input: #fafafa
```

> **Contrast gate (Design Boss):** all semantic pairs must pass WCAG 2.2 AA — the
> `tests/tokens.test.ts` fixture asserts computed contrast ≥ 4.5:1 for text pairs and
> ≥ 3:1 for large text/UI components.

---

## 8. Component Contract (Svelte Boss + Design Boss)

Every component obeys these invariants (from `port-component` + `svelte-styling-patterns`):

1. **Svelte 5 runes only** — `$props()`, `$state`, `$derived(expr)` (never
   `$derived(() => …)`), `$bindable`, `$effect`. No `$:` or legacy stores.
2. **Snippets for children** — `children?: Snippet`, rendered `{@render children?.()}`.
3. **`data-slot` is the only styling hook** — no `class` attribute on component-owned
   elements, no `cn()`, no layout classes in markup.
4. **Variants are typed props → `data-*` attributes** — SASS nests on them.
5. **Colocated `<name>.sass`** — indented, single-tab, no braces/semicolons, registered
   in `styles/index.sass`. Zero `<style>` blocks.
6. **Tokens only** — `var(--muted-foreground)`, never hardcoded colors.
7. **`ref` is `$bindable(null)`** bound with `bind:this`.
8. **Icons are children** — the library ships no icon dependency.
9. **Folder + `index.ts` barrel** per component; explicit subpath export in package.json.
10. **`onclick`-style event props** (Svelte 5 event props), spread of rest props.
11. **A11y checklist per component (D8):** semantic element, label/aria-label, focus
    visible ring (`+focus-ring`), keyboard support, `aria-*` wiring, reduced-motion
    path, hover-only features gated on `useHoverCapable()`.
12. **Per-port ledger** (`ports/<name>.json`): source URL, deps dropped, props
    invented, deliberate deviations (port-component pattern).

### 8.1 Mixins (`src/lib/styles/_mixins.sass`)

```sass
@mixin interactive($cursor: pointer)
	cursor: $cursor
	user-select: none
	-webkit-tap-highlight-color: transparent

@mixin focus-ring($width: 3px, $color: var(--ring), $alpha: 30%)
	&:focus-visible
		outline: none
		box-shadow: 0 0 0 #{$width} color-mix(in oklab, #{$color} #{$alpha}, transparent)

@mixin icon-child($size: 1rem)
	& svg
		width: $size
		height: $size
		flex-shrink: 0
```

---

## 9. Detailed Phases

Each phase lists **Objective / Active boss / Files & ownership / Interfaces /
Constraints / Verification**. Verification commands are the *only* definition of
done; nothing ships without the listed checks.

---

### Phase 0 — Scaffold, spike, and motion-engine proof

**Objective:** Working skeleton: package + docs app build, `svelte-package` emits,
vitest runs, and the engine's core capabilities (press springs, `layoutId` shared
layout, `AnimatePresence` exit, SSR hydration) are proven with the Button and Tabs
prototypes — the **D1 verification gate**.

**Active boss:** Svelte (Creator handoff accepted for scaffold shape).

**Files & ownership:**
- Repo scaffold (package.json, svelte.config.js, vite.config.ts, tsconfig, app.html)
- `src/lib/ease.ts` (motion transition presets), `src/lib/motion/use-hover-capable.svelte.ts`
- Dependency: `@humanspeak/svelte-motion` (peer + dev, ^0.8.0)
- `src/lib/styles/_tokens.sass`, `_mixins.sass`, `index.sass`
- Prototypes: `components/motion/button/*`, `components/motion/tabs/*`
- `tests/setup.ts`, first unit tests

**Interfaces:**
- `SPRING_*` transition presets (as §6.1) — passed to `motion.<tag>` / `AnimatePresence`
- `motion.<tag>` + `AnimatePresence` + `layoutId` from `@humanspeak/svelte-motion`
- `useHoverCapable()` → `{ current: boolean }` (CSS-side gating only)

**Constraints:**
- Single animation dependency: `@humanspeak/svelte-motion` (D1); no other animation
  libraries — never the legacy `svelte-motion` package.
- Phase-0 gate: empirically verify `layoutId` + `AnimatePresence` + SSR hydration (D1).
- Button and Tabs fully pass the component contract (§8) before the phase ends.

**Verification:**
```bash
pnpm check                 # svelte-check, 0 errors
pnpm test                  # vitest: ease presets, tabs layoutId, AnimatePresence exit
pnpm dev --port 5199       # human check of button + tabs in light & dark
```

---

### Phase 1 — Foundation: tokens, motion runtime, docs chrome

**Objective:** Token system final, motion runtime hardened, docs site layout
(navbar, theme provider light/dark, component page route) live.

**Active boss:** Svelte (+ Design for tokens & theme).

**Files & ownership:**
- `src/lib/styles/*` (tokens, mixins, index)
- `src/lib/utils.ts` (type helpers — **no cn()**)
- `src/routes/+layout.svelte`, `+page.svelte`, `docs/[category]/[slug]/+page.svelte`,
  `src/lib/docs/*` (registry catalog, props table, examples harness)
- `tests/tokens.test.ts` (contrast gate)

**Constraints:**
- Two-layer tokens only; component SASS consumes semantic tokens (D2).
- Contrast gate enforced by test.

**Verification:**
```bash
pnpm check && pnpm test
pnpm dev --port 5199
```

---

### Phase 2 — Tier 1 core motion primitives

**Objective:** Ship the 12 Tier-1 components (§5) with full a11y + reduced motion.

**Active boss:** Svelte (primary); Design consulted per component (tokens, motion,
a11y).

**Files & ownership:** `src/lib/components/motion/<slug>/*` for each Tier-1 item;
each with `.svelte`, `.sass`, `index.ts`, `ports/<slug>.json`.

**Interfaces:** Public props per beUI registry API reference, translated:
- `Button`: `{ variant: 'primary'|'secondary'|'ghost'|'outline', size: 'sm'|'md'|'lg'|'icon', pressScale?: number, ripple?: boolean, children?: Snippet, onclick?: (e: MouseEvent) => void }` (+ `StatefulButton` with `state: 'idle'|'loading'|'success'|'error'` + `loadingText/successText/errorText`; + `MagneticButton` with `strength`).
- `Tabs`: `{ tabs: {id,label}[], activeId: $bindable<string>, variant: 'pill'|'segment'|'underline', children?: Snippet }` + full keyboard/ARIA.

**Constraints:**
- Every component passes the §8 contract; Tabs meets D8 keyboard spec; all springs
  gated on reduced-motion token.
- No Tailwind, no cn(), no icon imports.

**Verification:** per component — `pnpm check && pnpm test`; Tabs additionally has
`tests/tabs.test.ts` (keyboard arrows, home/end, aria-selected, roving tabindex) and
a Playwright interaction test.

---

### Phase 3 — Tier 2 AI agent primitives

**Objective:** Port the 16 agent-facing components; check fractalsvelte `ai-elements`
overlap and reuse rune patterns where the motion doesn't differ.

**Active boss:** Svelte (Agent boss consulted for agent-state UX patterns).

**Files & ownership:** `src/lib/components/agents/<slug>/*`.

**Interfaces:** beUI registry API reference translated to Svelte props; e.g.
`PromptInput: { value?: $bindable<string>, placeholder?: string, isGenerating?: boolean, onsend?: (v: string) => void, onstop?: () => void }`.

**Constraints:**
- Auto-growing textarea (scrollHeight) with `bind:this`; Enter-to-send (Shift+Enter
  for newline); animated send↔stop swap gated on `isGenerating`; announce status via
  `aria-live` region (Design Boss).

**Verification:** `pnpm check && pnpm test`; Playwright test for
`prompt-input` (typing, Enter, swap to stop).

---

### Phase 4 — Tier 3 product blocks

**Objective:** Port the priority blocks: `dynamic-island`, `command-palette`,
`otp-input`, `file-upload`, `notification-stack`, `expandable-tabs`,
`expandable-action-bar`, `overflow-actions`, `swipeable-list`, `bloom-menu`,
`feedback-widget`, `not-found`, `chat-app`, `morphing-modal`, `drawer`,
`bottom-sheet`, `bounce-sidebar`, `dock`, `shared-layout-bg`, `theme-toggle`.

**Active boss:** Svelte + Design (blocks are where motion polish shows).

**Interfaces:** `DynamicIsland: { state: 'idle'|'timer'|'call'|'compact', title?: string }` — shell morph uses `motion.div layout` + `AnimatePresence` blur crossfades; `CommandPalette` composable primitives with active-row spring (`layoutId`).

**Constraints:**
- Modal/sheet primitives handle focus trap, scroll lock, esc-to-close, `aria-modal`.
- Drawer/sheet open/close transitions via `AnimatePresence` + `initial`/`animate`/`exit`
  (the engine's clone-exit path), not a layout engine.
- Stretch items (§5) explicitly deferred post-v1.

**Verification:** `pnpm check && pnpm test`; Playwright smoke per block.

---

### Phase 5 — Registry API server + docs polish

**Objective:** `/r/registry.json` + `/r/[name].json` serving shadcn-schema items;
docs pages for every ported component.

**Active boss:** Svelte (Code boss review for the server contract).

**Files & ownership:**
- `src/lib/registry-server.ts`, `scripts/check-registry.ts`, `scripts/gen-registry.ts`
- `src/routes/r/registry.json/+server.ts`, `src/routes/r/[name].json/+server.ts`
- Docs pages `src/routes/docs/[category]/[slug]/+page.svelte`

**Interfaces:**
```jsonc
// GET /r/registry.json
{
  "name": "beui-svelte",
  "homepage": "https://beui.dev",
  "items": [
    { "name": "button", "type": "registry:component", "dependencies": ["svelte"], "registryDependencies": [] }
  ]
}
// GET /r/button.json
{
  "name": "button",
  "type": "registry:component",
  "title": "Button",
  "description": "Spring-pressed Button plus StatefulButton.",
  "dependencies": ["svelte"],
  "registryDependencies": [],
  "files": [
    { "path": "components/motion/button/button.svelte", "type": "registry:component", "content": "<source>" },
    { "path": "components/motion/button/button.sass", "type": "registry:style", "content": "<source>" }
  ],
  "raw": "<concatenated source>"
}
```

**Constraints:**
- 404 for unknown slugs; 500 with message on bundling failure.
- `check-registry.ts` validates every catalog item: slug exists on disk, exports
  resolve, SASS compiles (`npx sass`), no Tailwind tokens leak into sources.

**Verification:**
```bash
pnpm run check:registry     # all items pass resolution + compile
pnpm check && pnpm test
pnpm dev --port 5199        # curl /r/registry.json and /r/button.json
```

---

### Phase 6 — Testing, QA, CI, and release

**Objective:** Full test matrix green, CI pipeline defined, package publishable
(`publint` clean), quality-gate passed.

**Active boss:** Svelte → **Code boss** for ship gates.

**Files & ownership:**
- `tests/*` (unit, component, tokens), `e2e/*` (Playwright), visual QA config
- `.github/workflows/ci.yml` (or Vercel/GitHub Actions equivalent)
- `package.json` (final scripts)

**Verification matrix:**
```bash
pnpm check && pnpm lint && pnpm test && pnpm run check:registry   # CI job 1
pnpm test:e2e                                                      # CI job 2 (Playwright webServer)
pnpm build && pnpm pack --dry-run && publint                       # CI job 3 (package)
pnpm test:visual                                                   # light + dark screenshots, diff
```

**Definition of done:** `/quality-gate` (visual + a11y) passes; `publint` clean; CI
green on `main`; first `@beui/svelte` version published; docs live.

---

## 10. Testing & QA Strategy (Code boss)

| Layer | Tool | Covers |
| --- | --- | --- |
| Unit | Vitest | ease/transition presets, motion prop mapping, utils |
| Component | @testing-library/svelte | props, snippets, events, a11y roles (tabs keyboard, switch toggle, prompt-input Enter) |
| Tokens/contrast | Vitest fixture | WCAG 2.2 AA computed contrast, token presence |
| E2E | Playwright | Tabs/switch/button/modal flows; reduced-motion emulation; `webServer` auto-start |
| Visual QA | Playwright screenshots (light + dark) | regression diff per component; browser-qa skill checklist |
| Package | publint + `svelte-package` | exports, types, files allowlist |

---

## 11. Milestones & Risk Register

### Milestones

| # | Milestone | Exit criteria |
| --- | --- | --- |
| M1 | Motion proof | Phase 0 green: button + tabs with springs/layoutId/AnimatePresence + a11y |
| M2 | Core v1 | Phase 2 green: 12 Tier-1 primitives |
| M3 | Agent v1 | Phase 3 green: 16 agent primitives |
| M4 | Blocks v1 | Phase 4 green: priority blocks |
| M5 | Registry + docs | Phase 5 green: shadcn-schema registry live |
| M6 | Release | Phase 6 green: CI + publint + published `@beui/svelte` |

### Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Pre-1.0 dependency (v0.8.x); npm README lags docs on `layoutId` | Medium | Phase-0 verification gate (D1); pin `^0.8.0`; docs site authoritative; fall back to `layout` or clone-exit for any failing scenario. |
| Scope creep (60 components) | High | Tiers + explicit stretch deferrals; blocks phased; docs/registry phase ships before stretch items. |
| beUI React code assumes `motion/react` APIs | Low | `@humanspeak/svelte-motion` is Framer-Motion-parity; port is mechanical. Residual gaps documented per component in `ports/<slug>.json`. |
| Overlap with fractalsvelte `ai-elements` | Medium | Reuse-first policy in Tier 2; ledger notes overlap; avoid duplicate maintenance. |
| Virtualization/WebGL stretch items | Medium | Deferred post-v1; behind motion façade if adopted (D1 fallback). |
| `layoutId` expectations from consumers | Low | Docs explain `layoutId` + `LayoutGroup` as the shared-layout primitive; recipe pages per component. |

---

## 12. Boss Handoff Map

| Step | Active boss | Who reviews |
| --- | --- | --- |
| Scaffold + motion engine | Svelte | Code (type/build) |
| Tokens + theme + a11y spec | Design | Design (quality-gate) |
| Component ports (Tiers 1–3) | Svelte | Svelte reviewer + a11y-architect per component; Design for motion polish |
| Agent primitives | Svelte | Agent (UX patterns) + Svelte |
| Registry + server | Svelte | Code (server contract) |
| Tests + CI + release | Code | Code (quality-gate, santa-loop on release) |

Every phase hands off with verification evidence; no phase claims completion without
its listed commands passing.

---

*Plan revised under `activate-boss-svelte` + `activate-boss-design` (Fractal Agentic).
Source of truth: https://beui.dev (registry), monorepo conventions: `fractalsvelte`
port pattern, `svelte-styling-patterns`, `port-component` skill.*
