# Fractals Design System — one system, every project

_Concept & spec · Revision 1 · Bosses: Design (tokens, a11y, motion) + Svelte (indented SASS, component contract)_

> The problem this solves: you keep rebuilding the same design system in every
> project — and each rebuild drifts. This document names the drift, fixes the
> canonical scales once, and specifies the single package that ships them.

---

## 0. The study — what exists today

Eight distinct token systems currently live in the monorepo. They share the same
DNA (indented SASS, layered partials, `@forward 'mixins'`, a 00→100 primitive
scale, semantic text/border roles, a 4px-rooted space scale, motion that only
touches transform/opacity) but disagree on every number and every name.

| Project | File | Primitive scale | Radius | Space | Accent | Theme protocol | Motion |
|---|---|---|---|---|---|---|---|
| **fractals-styler** (scaffold) | `templates/_tokens.sass` | `--color00..100` | — (none shipped) | 4px root (utilities) | `--accent10/20/30` blue | `:root` + `.theme-*` class | none |
| **fracta** (app) | `src/lib/styles/_tokens.sass` | `--color00..100` warm paper | 3/6/10/14/18 | 4/8/16/32/64/80/128 | green `forest→green-bright` | `[data-theme]` + `prefers-color-scheme` | 80/180/280/560ms + eases |
| **shradhapp** (app) | `src/lib/styles/_tokens.sass` | `--surface-1/2/3` + aliases | **3 & 6 only** | 4/8/16/32/64/80/128 | `--accent` (#0e6dd9 / #f4ae64) | `[data-theme]` | 80/140/200/320ms + ease ladders |
| **fractal-agentic/site** | `site/src/lib/styles/_tokens.sass` | `--ink-50..950` | **5 & 10 only** | rem `space-1..16` | violet + green | `:root` dark + `[data-theme="light"]` | easeIn/Out ladders |
| **fractalwiki** (site) | `src/lib/styles/_tokens.sass` | `--color00..100` slate | 4/8/12 | — | indigo `#4f46e5` | `.theme-light` / `.theme-dark` | none |
| **fractalmem** (site) | `src/lib/styles/_tokens.sass` | `--color00..100` gray | — | — | blue | `:root` | none |
| **fractaldesign** (site) | `src/lib/styles/_tokens.sass` | `background10..50` / `foreground10..50` | 6/8/12/pill | `size2..64` | magenta `#c8045c` | `.default-light` class | 120/200/320ms |
| **fractalmandala** (site) | `src/lib/styles/_tokens.sass` | `surface-viewer/sidebar/...` | — | `size2..128` | green `#039140` | `.theme-light-default` / `.theme-dark-default` | none |
| **fractalsvelte** (library) | `src/lib/styles/_tokens.sass` | shadcn `--background/--foreground/...` (oklch) | `--radius` derived (sm−4/md−2/lg/xl+4) | Tailwind 0.25rem | `--primary` | `.dark` class | 150ms base |
| **fractal-svelte** (beUI port) | `src/lib/styles/_tokens.sass` | `--beui-gray-50..900` | 6/8/12/full | 4/8/12/16 | blue/red/emerald | `.dark` class | `--beui-motion-scale: 0` |

### The drift, named

1. **Radius war** — shradhapp says *"only 3px and 6px"*; agentic/site says *"only 5px or 10px"*; fracta uses a 3/6/10/14/18 concentric ladder; fractalsvelte derives from one `--radius`. Same surface, four answers.
2. **Accent slot** — every project hand-picks a different brand color and names it differently (`--accent`, `--theme-color`, `--primary`, `--accent10`). There is no shared "brand slot" contract.
3. **Theme protocol** — `[data-theme]` (fracta, shradhapp), `.theme-*` body classes (wiki, mandala, design), `.dark` class (fractalsvelte, beui). Three mechanisms for one concept.
4. **Breakpoints** — fractals-styler ships 720/1024/721/1025/1201px; fractalsvelte ships Tailwind rem (40/48/64/80/96). Two ladders.
5. **Motion values** — 80/180/280/560 vs 80/140/200/320 vs 120/200/320 vs 150. Same feel, different numbers.
6. **Component contract** — only fractalsvelte has one (`[data-slot]`, `[data-variant]`, `[data-size]` + mixins). Apps hand-roll component classes per project.
7. **The JIT utility layer** — fractals-styler's `gapN`/`padN`/`--pxN`/breakpoint-suffix system is the strongest existing piece and is already adopted (fractalwiki, agentic/site docs). It should be the *foundation*, not an add-on.

### The shared DNA (what we keep — it was already right)

- Single-tab **indented SASS**, no braces, no semicolons.
- Layered architecture, lower layers never reach upward:
  `tokens → globals → typography → primitives → buttonslinks → layouts → components/domain`.
- A primitive 00→100 light-to-dark neutral scale + **semantic roles**
  (`--text-primary/secondary/tertiary`, `--border-*`) so components never hardcode hex.
- Space rooted in 4px: **4, 8, 16, 32, 64, 80, 128** (`--space-1..7`).
- **Controls ≥ 40px, primary actions ≥ 44px.**
- Body line-height **1.5**, headings **1.1**; `--text-scaling: 1.2` with `.text-xs..5xl`.
- Motion: **transform + opacity only**, reduced-motion first, shared duration tokens.
- Component `.svelte` + colocated `.sass` pairs, styles owned by the component.

---

## 1. Design principles (the rules)

1. **One source of truth.** Tokens live in the design-system package. A project
   never invents a new scale — it overrides a brand slot or a semantic role.
2. **Primitive → semantic → component.** Three layers; components consume only
   semantic + component tokens, never primitives directly.
3. **Compositional, not a utility catalogue.** Assemble from families
   (`flex/row/col/grid`, surfaces, controls) before inventing a class name.
4. **Brand is a slot, not a scale.** `--theme-color` / `--accent` is the one
   thing a project customizes; the system supplies contrast-safe neighbors.
5. **Concentric radius.** Outer radius ≈ inner radius + padding. One ladder,
   applied optically, never formula-worshipped.
6. **Motion must explain state.** Guide attention, communicate state, or
   preserve continuity — else remove it. Transform + opacity only.
7. **Reduced motion is a design token**, not a media query afterthought.
8. **Semantic contrast gate.** Every role pair must clear WCAG 2.2 AA (4.5:1
   body, 3:1 large/UI). Fractalmem already proved the discipline (`--text-tertiary: #757575`
   deliberately off-scale to pass).
9. **Accessibility is structural.** Focus rings, aria, hit areas, tabular
   numerals — in the tokens and mixins, so every project inherits them.

---

## 2. Token architecture (three layers)

All tokens are CSS custom properties in indented SASS. The **primitive layer** is
the physical palette; the **semantic layer** is what components read; the
**component layer** is per-`[data-slot]`/variant/size.

### Layer 1 — primitives

```sass
// _tokens.sass (shipped by the package, ~this shape)
:root
	// Neutral scale — light step 00, dark step 100. Any project may re-tint these
	// (fracta's warm paper is the canonical alternative).
	--color00: #FFFFFF
	--color10: #f5f5f5
	--color20: #e8e8e8
	--color30: #d6d6d6
	--color40: #c2c2c2
	--color50: #a1a1a1
	--color60: #818181
	--color70: #6a6a6a
	--color80: #474747
	--color90: #2f2f2f
	--color100: #111111

	// Brand slot — the ONLY thing a project re-skins. Defaults to fractal green
	// (mandala/agentic/fracta lineage). Derived steps guarantee contrast pairs.
	--brand: #039140
	--brand-hover: #0d6219
	--brand-soft: rgba(3, 145, 64, .12)
	--brand-ink: #FFFFFF

	// Geometry
	--space-1: 4px
	--space-2: 8px
	--space-3: 12px      // intermediate optical step
	--space-4: 16px
	--space-5: 24px      // intermediate optical step
	--space-6: 32px
	--space-7: 64px
	--space-8: 80px
	--space-9: 128px

	// Radius ladder — concentric (outer ≈ inner + padding)
	--radius-xs: 3px      // small marks, tags
	--radius-sm: 6px      // controls, inputs
	--radius-md: 10px     // cards, surfaces
	--radius-lg: 14px     // dialogs, nested surfaces
	--radius-xl: 18px     // large panels
	--radius-full: 9999px // pills, avatars

	// Typography
	--font-sans: 'Google Sans Flex', system-ui, sans-serif
	--font-mono: 'JetBrains Mono', ui-monospace, monospace
	--text-scaling: 1.2
	--text-xs: 10px
	--text-sm: 12px
	--text-md: 14px
	--text-bs: 1rem
	--text-lg: calc(var(--text-bs) * var(--text-scaling))
	--text-xl: calc(var(--text-lg) * var(--text-scaling))
	--text-2xl: calc(var(--text-xl) * var(--text-scaling))
	--text-3xl: calc(var(--text-2xl) * var(--text-scaling))
	--text-4xl: calc(var(--text-3xl) * var(--text-scaling))
	--text-5xl: calc(var(--text-4xl) * var(--text-scaling))
	--lh-body: 1.5
	--lh-heading: 1.1

	// Breakpoints — canonical ladder (fractals-styler's, kept)
	--bp-xs: 720px
	--bp-sm: 1024px
	--bp-lg: 1025px
	--bp-xl: 1201px

	// Depth
	--elevation-1: 0 1px 2px rgba(18, 22, 31, .06), 0 1px 1px rgba(18, 22, 31, .04)
	--elevation-2: 0 2px 6px rgba(18, 22, 31, .08), 0 1px 2px rgba(18, 22, 31, .05)
	--elevation-3: 0 8px 24px rgba(18, 22, 31, .12), 0 2px 6px rgba(18, 22, 31, .06)
	--elevation-float: 0 6px 20px rgba(18, 22, 31, .10), 0 1px 3px rgba(18, 22, 31, .06)

	// Layering
	--z-panel: 10
	--z-popover: 100
	--z-dialog: 1000
	--z-toast: 2000
```

### Layer 2 — semantic roles

Read by components. **Everything flips in dark mode; nothing is re-inverted mechanically.**

```sass
// _theme.sass
:root, [data-theme='light']
	color-scheme: light
	--bg-app: var(--color00)
	--bg-raised: var(--color10)
	--bg-sunken: var(--color20)
	--bg-hover: color-mix(in srgb, var(--color100) 6%, var(--color00))
	--bg-active: color-mix(in srgb, var(--color100) 12%, var(--color00))
	--surface-popover: var(--color00)
	--text-primary: var(--color100)
	--text-secondary: var(--color70)
	--text-tertiary: var(--color50)
	--border-primary: var(--color30)
	--border-secondary: var(--color50)
	--border-tertiary: var(--color20)
	--ring: var(--brand)
	--ink-on-brand: var(--brand-ink)
	--state-hover: rgba(17, 17, 17, .045)
	--state-active: rgba(17, 17, 17, .085)
	--state-selected: var(--brand-soft)

[data-theme='dark']
	color-scheme: dark
	--bg-app: var(--color00)          // theme's dark 00
	--bg-raised: var(--color10)
	--bg-sunken: var(--color20)
	--bg-hover: color-mix(in srgb, var(--color100) 10%, var(--color00))
	--bg-active: color-mix(in srgb, var(--color100) 16%, var(--color00))
	--surface-popover: var(--color10)
	--text-primary: var(--color100)
	--text-secondary: var(--color70)
	--text-tertiary: var(--color50)
	--border-primary: var(--color30)
	--border-secondary: var(--color50)
	--border-tertiary: var(--color20)
	--ring: var(--brand)
	--ink-on-brand: var(--brand-ink)
	--state-hover: rgba(255, 255, 255, .06)
	--state-active: rgba(255, 255, 255, .1)
	--state-selected: var(--brand-soft)

@media (prefers-color-scheme: dark)
	:root:not([data-theme])
		// duplicate the dark block — system preference is the default,
		// an explicit [data-theme] always wins
```

**Theme protocol (decision D1):** `[data-theme='light'|'dark']` on the document
root is the **only** mechanism. `prefers-color-scheme` fills the unset default.
This absorbs shradhapp/fracta's `[data-theme]`, fractalsvelte/beui's `.dark`
(emitted as an alias `[data-theme='dark']`), and the `.theme-*` body classes
(deprecated alias). One mechanism, one meaning.

### Layer 3 — component tokens

Per-component, colocated in the component's `.sass` under `[data-slot='...']`.
No hardcoded hex, no invented scales — only semantic roles + the radius ladder
(mirrors fractalsvelte's existing contract).

```sass
// components/button/button.sass (shape)
[data-slot='button']
	+interactive(pointer)
	+focus-ring(3px, var(--ring), 30%)
	+icon-child(1rem)
	border-radius: var(--radius-sm)
	&[data-variant='primary']
		background: var(--brand)
		color: var(--ink-on-brand)
	&[data-variant='outline']
		border: 1px solid var(--border-primary)
		background: var(--bg-app)
	&[data-variant='ghost']
		color: var(--text-primary)
	&[data-size='sm']
		height: 2rem
		padding-inline: var(--space-3)
	&[data-size='md']
		height: 2.25rem
		padding-inline: var(--space-4)
	&[data-size='lg']
		height: 2.75rem
		padding-inline: var(--space-5)
```

---

## 3. Motion system

One token set, consumed by **both** CSS transitions and
`@humanspeak/svelte-motion` (the Framer-Motion-parity engine already used by
fracta and shradhapp). Durations and eases are the canonical ladder; springs are
named presets for the motion library.

```sass
// _motion.sass
:root
	--dur-instant: 80ms   // tooltip, focus ring, badge
	--dur-fast: 180ms     // button feedback, icon swap, hover
	--dur-mid: 280ms      // entering content, cards, modals
	--dur-slow: 560ms     // hero, onboarding (sparingly)
	--ease-out: cubic-bezier(0.22, 1, 0.36, 1)
	--ease-smooth: cubic-bezier(0.22, 1, 0.36, 1)
	--ease-sharp: cubic-bezier(0.4, 0, 0.2, 1)
	--ease-out-soft: cubic-bezier(0.33, 1, 0.68, 1)
	--motion-distance-xs: 4px
	--motion-distance-sm: 8px
	--motion-distance-md: 16px
	--motion-distance-lg: 24px

	// Reduced motion is a token: 1 = animate, 0 = opacity-only. Mirrors the
	// --beui-motion-scale pattern from fractal-svelte, generalized.
	--motion-scale: 1

@media (prefers-reduced-motion: reduce)
	:root
		--motion-scale: 0
		*, *::before, *::after
			animation: none !important
			transition-property: opacity !important
			transition-duration: 1ms !important
			transform: none !important
```

**Svelte Motion gateway (decision D2):** every animated app/site keeps a single
`src/lib/motion.ts` (already the pattern in fracta + shradhapp) that:

- re-exports `useReducedMotion` from `@humanspeak/svelte-motion`;
- reads the CSS token via `getComputedStyle` once for parity with pure-CSS motion;
- exports named presets: `presets.enter`, `presets.press = { scale: 0.96 }`, `presets.shift = { y: 8 }`;
- never animates width/height/margin/padding/positional layout — transform + opacity only.

**Rules (from motion-foundations / motion-ui, adapted):** animate only to guide
attention, communicate state, or preserve continuity; reduced motion overrides
everything; `initial` must match server output (SSR safety); no `transition: all`;
no `will-change: all`; `AnimatePresence mode` always explicit; `layoutId` only for
shared elements; stagger ≤ 0.1s.

---

## 4. Typography & polish (from better-interface / make-interfaces-feel-better)

- Body copy `1.5` line-height; headings `1.1`. Measure ~60–72ch for prose.
- `text-wrap: balance` on headings/short titles; `text-wrap: pretty` on
  short-to-medium body; never on code/preformatted.
- `font-variant-numeric: tabular-nums` on counters, timers, prices, tables.
- Root `-webkit-font-smoothing: antialiased` / `-moz-osx-font-smoothing: grayscale`.
- Images get a neutral inset outline (`outline: 1px solid rgba(0,0,0,.1); outline-offset: -1px`,
  white alpha in dark) — never brand-tinted.
- Hit areas: controls ≥ 40px, primary ≥ 44px, expanded via pseudo-element when
  the visible icon is smaller.
- Press feedback `scale(0.96)` on tactile buttons, disabled under reduced motion.
- Icon swaps cross-fade (opacity + scale + blur), never instant toggles.
- Focus rings always visible; dialogs trap focus, close on Escape, restore trigger.

These live in `_globals.sass` + the component mixins so every project inherits them.

---

## 5. The component contract

**fractalsvelte's contract becomes THE contract** (it is already the most mature):

- `[data-slot='component']` root; `[data-variant]`, `[data-size]`, `[data-radius]`,
  `[data-text-size]`, `[data-transform]` prop-driven styles.
- Shared mixins (`_mixins.sass`) — already written, already battle-tested:

```sass
=interactive($cursor: default)      // disabled/aria-disabled 50% + pointer-events none
=focus-ring($width, $color, $opacity)  // :focus-visible ring via box-shadow
=invalid-ring                        // aria-invalid border + ring
=icon-child($size)                   // svg pointer-events none, shrink-0, size
=radius-variants / =text-size-variants / =text-transform-variants
=truncate
```

- Apps **compose** these families (`flex/row/col/grid`, `surface`, `control`,
  `button`, `icon-button`, `link`) before naming a new class (shradhapp's
  "universal styling vocabulary" + agentic/site's "generalise a type" rule).

**Where components live:** `fractalsvelte` is the shared component library.
Apps own only **domain** modules (fracta's `preview/components/*`, shradhapp's
`navigation`/`projectstudio`/...) that compose library primitives.

---

## 6. fractals-styler v2 — the package that ships it

`fractals-styler` already provides the JIT utilities, breakpoint suffixes,
`--pxN`, and the `init` scaffolder. It becomes the **single design-system
foundation package** (decision D3):

```
packages/fractals-styler/
├── templates/
│   ├── _tokens.sass        # layer-1 primitives (this doc §2)
│   ├── _theme.sass         # layer-2 semantic roles + [data-theme] light/dark
│   ├── _motion.sass        # motion tokens + reduced-motion token
│   ├── _typography.sass    # text scale + lh + wrap + tabular helpers
│   ├── _globals.sass       # reset, smoothing, focus, selection, scrollbars, a11y base
│   ├── _primitives.sass    # box/row/col/grid + surfaces + controls families
│   ├── _buttonslinks.sass  # shared control/link family
│   ├── _mixins.sass        # +bp-* + interactive + focus-ring + invalid-ring + icon-child
│   └── index.sass          # @forward 'mixins' + ordered @use
├── src/                    # JIT scanner/generator (unchanged core)
├── design-tokens.json      # emitted portable token subset (W3C-ish, like wiki/shradhapp)
└── cli: init, token-sync   # init scaffolds; token-sync regenerates design-tokens.json
```

**Adoption in a new project (one command + one slot):**

```sh
pnpm add fractals-styler            # monorepo link
npx fractals-styler init            # scaffolds the full layered system
```

```sass
// src/lib/styles/_brand.sass — the ONLY customization a project makes
:root
	--brand: #c8045c        // fractaldesign's magenta, fractalwiki's indigo, etc.
	--font-sans: 'Inter', sans-serif
```

**fractalsvelte v2** consumes `fractals-styler`'s tokens (its current oklch
shadcn set becomes an alias layer mapped onto the same semantic roles — decision
D4). `fractal-svelte` (beUI port) renames `--beui-*` → canonical tokens with
aliases kept for compat (D5).

---

## 7. Migration roadmap (orch-refine-code discipline)

Behavior-preserving, per project, in small steps with tokens aliased first so
nothing ever breaks mid-flight.

**Order (cheapest → costliest):**

1. **Ship fractals-styler v2** with the canonical templates (§2–§5) + alias layer
   (old token names emit as aliases of new ones). No consumer changes yet.
2. **fractalwiki** — already on fractals-styler + JIT; adopt `_theme.sass`,
   swap `.theme-light/.theme-dark` → `[data-theme]`, map `--bg-*` aliases.
3. **fractalmem** — cleanest token set (color00..100 already canonical); adopt
   `_motion.sass`, keep the WCAG-corrected `--text-tertiary` as the semantic default.
4. **fractaldesign / fractalmandala** — adopt `_theme.sass` + `[data-theme]`,
   collapse `surface-*`/`background*` maps onto semantic roles; keep each site's
   brand slot (`#c8045c`, `#039140`).
5. **fracta** — the most complete existing system (paper neutrals + green +
   concentric radius + `[data-theme]`): promote its values to the canonical
   defaults where they're better (radius ladder, warm paper), alias the rest.
6. **shradhapp** — hardest (own surface map + 3/6-only rule): keep 3/6 as the
   control radii, adopt the ladder for nesting, `[data-theme]` already correct.
7. **fractal-agentic/site** — collapse `--ink-*` onto `--color*` aliases, keep
   violet+green dual accent via `--brand` + `--accent-secondary`.
8. **fractalsvelte / fractal-svelte** — alias oklch/`--beui-*` onto semantic
   roles; ship as the component layer consumers reach for.

**Every step:** `pnpm check` (tsc/svelte-check) + build + visual pass, exactly
the orch-refine-code "tests green before/after" gate. No step changes behavior —
only token indirection.

---

## 8. Quality gates (plankton / better-interface)

- **Write-time lint:** stylelint with the indented-SASS syntax plugin, enforcing:
  no hardcoded hex outside `_tokens.sass`/`_brand.sass`; no `transition: all`;
  no `!important` outside the reduced-motion block; component files consume only
  semantic tokens. Wire via the Plankton-style PostToolUse hook or CI step.
- **Per-project audits:** run `/better-interface` (full mode) on each migrated
  surface — a11y → layout → writing → typography → colors → UI, one ranked
  findings table, `Block`/`Needs changes`/`Approve` verdict.
- **`make-interfaces-feel-better` checklist** as the component-craft gate.
- **Contrast gate:** scripted check that `--text-*` on `--bg-*` pairs clear
  WCAG AA across both themes.
- **Motion review:** motion-foundations rules (transform+opacity only, reduced
  motion, SSR-safe initial, token-only values) run over every animated component.

---

## 9. Decision log

| # | Decision |
|---|---|
| D1 | Theme protocol = `[data-theme]` on root, `prefers-color-scheme` as default; `.dark`/`.theme-*` become aliases |
| D2 | `@humanspeak/svelte-motion` is the motion engine; every project keeps one `src/lib/motion.ts` gateway; CSS + JS motion read one token set |
| D3 | `fractals-styler` (v2) is the single design-system foundation: tokens, themes, motion, mixins, JIT, `init` scaffold |
| D4 | `fractalsvelte` consumes fractals-styler tokens; its shadcn oklch set becomes an alias layer |
| D5 | `fractal-svelte` (`--beui-*`) renames onto canonical tokens, aliases kept for compat |
| D6 | Radius = concentric ladder 3/6/10/14/18 + full; 3&6 remain the control radii (shradhapp rule kept) |
| D7 | Space = 4/8/12/16/24/32/64/80/128 (4px-root + optical intermediates); JIT `--pxN` for one-offs |
| D8 | Brand is a slot (`--brand` + derived hover/soft/ink), never a re-scoped scale |
| D9 | Breakpoints = fractals-styler ladder 720/1024/1025/1201; fractalsvelte's rem ladder aliased |
| D10 | Component contract = `[data-slot]` + `[data-variant]`/`[data-size]` + shared mixins, owned by fractalsvelte |

---

## 10. Risks & open questions

- **Alias debt:** shipping aliases (D4/D5/D9) makes migration safe but leaves a
  cleanup tail — plan a `token-sync --purge` pass after all projects migrate.
- **Radius reconciliation:** fracta's 3/6/10/14/18 ladder vs shradhapp's strict
  3&6 rule — D6 keeps both (controls 3/6, nesting uses the ladder). Validate
  visually on shradhapp before locking.
- **oklch vs hex:** fractalsvelte uses oklch for shadcn parity; the canonical
  layer uses hex/`color-mix`. Decide whether to standardize on oklch after the
  alias layer lands.
- **`--text-tertiary` AA:** fractalmem's `#757575` passes; fractals-styler's
  `--color50` (#a1a1a1) fails on white. The semantic default must be the
  contrast-safe value; the primitive step stays physical.
- **Governance:** every token file gets a "do not fork — alias instead" header,
  and `/styling-docs-builder` regenerates per-project style maps after each
  migration so drift becomes visible in review.
