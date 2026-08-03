# Fractals Design System — Revision 2 (utility-first)

_Follows Rev 1 (`fractals-design-system.md`). Rev 1 drifted toward semantic component
classes + spacing tokens + mixins — the user rejected all three. This doc records the
discovery evidence and the corrected direction. The system is **utility-first**:
compose from fractals-styler's infinite numeric classes + a small fixed vocabulary.

## User's stated preferences (non-negotiable)

1. **Hate creating new classes for everything.** Prefer `class="box gap8 ycenter pad16"`
   over a bespoke `.rail-eyebrow__child` that bundles `display:flex; flex-direction:column;
   gap: var(--space8)`.
2. **Don't like spacing tokens (`--space-*`).** fractals-styler already emits infinite
   classes: `padleft8`, `margintop16`, `gap32`, etc. Variables are redundant.
3. **Hate mixins.** No `+bp-*`, no `+focus-ring`, no `+interactive` in consumer code.

## Evidence from the codebase (discovery, 2026-08-03)

### Utility composition is ALREADY how the code is written

`fractalwiki/src/routes/+page.svelte`:
```
<div class="home-container flex-col gap32 padtop16">
<section class="hero-section flex-col gap12 pad32 radius12 bdr">
<span class="hero-badge pad4 padleft12 padright12 radius16 text-xs text-bold inline-self-start">
<div class="hero-actions row ycenter gap16 margintop16">
```
`Header.svelte`: `class="app-header row xbetween ycenter pad16 padleft24 padright24 bdr-bottom"`,
`class="search-btn row ycenter gap12 pad8 padleft16 padright16 radius20 text-xs text-secondary"`.

`shradhapp/routes/design-system/+page.svelte`:
```
<main class="col min-h-0 pad32 gap32">
<header class="row ycenter xbetween wrap gap16">
<section class="surface panel pad32 gap16">
```
`HomeWorkspace.svelte`: `class="blank box xleft pad16 on-hover"`, `class="grid grid-cols-3"`.
`ProjectSidebar.svelte`: `class="blank noxp xleft grow min-w-0 box"`.

`fracta` app-sidebar: `class="entry-row box gap8"`, `class="item-details row wrap gap16 ycenter"`.

**Conclusion:** the pattern is `box/row/col/grid` + alignment modifiers (`ycenter`,
`xbetween`, `xleft`, `ytop`) + numeric utilities (`gap8`, `pad32`, `padleft16`,
`margintop16`) + a **thin layer of semantic classes** (`surface`, `panel`, `button`,
`icon-button`, `button-primary`, `link`, `notice`, `eyebrow`, `text-muted`, `bdr`).
The bespoke-class count is low and mostly for genuinely domain-specific things.

### Mixins are barely used
`apps/shradhapp/src`: `+bp-` appears only as a comment in `_mixins.sass`. Zero mixin
invocations in shradhapp consumer code. Confirms: mixins are not the working pattern.

## Corrected system (what we will actually build)

### 1. The utility layer IS the system
fractals-styler (JIT scanner + `virtual:fractals-styler.css`) stays the foundation:
`gapN/cgapN/rgapN`, `padN/padtopN/padbotN/padleftN/padrightN`, `marginN/margintopN/...`,
`heightN/widthN`, `--pxN`, breakpoint suffixes (`-xs/-sm/-bs/-lg/-xl`).
**No spacing variables. No spacing mixins.** Spacing is always the utility class.

### 2. The fixed vocabulary (small, non-negotiable, curated)
A short list of semantic classes that earn their place — they exist because they
bundle behavior/a11y, not because of laziness. **Never grow this list casually**;
a class must generalize a type (sidebar-list-item rule from agentic/site DESIGN.md).

- Layout: `box`, `row`, `col`, `grid` (+ `grid-cols-2..6`, `wrap`, `grow`,
  `shrink-0`, `min-w-0`, `min-h-0`, `w100`, `h100`, `wfull`, `hfull`)
- Alignment modifiers: `xleft/xcenter/xright/xbetween/xevenly`, `ytop/ycenter/ybot`
- Surfaces: `surface`, `surface-raised`, `panel`, `panel-header`, `panel-content`,
  `sidebar`, `drawer`, `notice`, `empty-state`
- Controls (a11y-bearing): `button`, `button-primary`, `button-quiet`, `icon-button`,
  `btn-icon`, `link`, `control`
- Type: `text-xs..text-5xl`, `text-bold/fw400/500/600`, `text-muted/text-secondary/
  text-accent/text-success/text-danger`, `tt-u`, `ta-l/c/r`, `lh11/lh15`, `truncate`
- Borders/radius: `bdr`, `bdr-bottom/top/left`, `radius4/6/8/12/16/20/full` (numeric!)
- Motion: `trans-std` (one shared transition class, explicit properties)

Numeric radius/height classes (`radius8`, `radius12`, `height48`) follow the same JIT
philosophy as spacing — extend the scanner's registry rather than creating variables.

### 3. Tokens exist ONLY for theming (color)
The ONE legitimate variable layer is semantic color, because light/dark needs it:
`--bg-app`, `--bg-raised`, `--text-primary/secondary/tertiary`, `--border-*`,
`--brand` (per-project slot), `--ring`. Components reference these; layout/spacing
never does. Theme protocol: `[data-theme="light"|"dark"]` on root, default follows
`prefers-color-scheme`.

### 4. No mixins in consumer code
Mixins live only inside fractals-styler / fractalsvelte internals (a11y bundles:
focus ring, icon sizing, disabled states). Consumers get the finished class, never
the mixin. Breakpoint-scoping of custom classes = `+bp-*` is forbidden in apps; use
the suffix system or a real responsive layout.

### 5. Component library stays fractalsvelte
`[data-slot]` + `[data-variant]`/`[data-size]` contract remains for the library.
Apps consume components as-is and compose everything else from utilities. Apps
should NOT hand-roll shadcn-style data-slot styling.

### 6. What a screen looks like
```svelte
<div class="row xbetween ycenter pad16 bdr-bottom">
	<div class="row ycenter gap8">
		<button class="icon-button" aria-label="Toggle sidebar">☰</button>
		<span class="text-bold">Fractalwiki</span>
	</div>
	<button class="search-btn row ycenter gap8 pad8 padleft16 padright16 radius20 text-xs">
		Search…
	</button>
</div>
```

## Guidelines (write once, obey always)

1. **Compose first.** Reach for `box/row/col` + gap/pad/margin numbers before any new class.
2. **A new class must generalize.** If it would apply to one element only, it's a
   utility composition, not a class.
3. **Never invent spacing variables or mixins.** The JIT class is the answer.
4. **Color only via semantic tokens.** No hex in components; dark mode stays correct.
5. **A11y bundles live in components** (`button`, `icon-button`, `control`), not markup.
6. **Radius/sizes are numeric classes** (`radius12`, `height48`) — extend the JIT
   registry, don't create tokens.
7. **Breakpoints via suffixes** (`pad8-xs`, `row-sm`) or responsive layout, never mixins.
8. **Theme switching = one attribute** (`data-theme`) on the root; nothing else.

## Concrete implementation plan (fractals-styler v2)

1. Extend JIT registry: radius (`radiusN`), height/width already exist; add
   `radiusN` + `inline-self-start` etc. as needed from real usage.
2. Curate the fixed vocabulary into `_primitives.sass` + `_buttonslinks.sass`
   (already mostly there — finalize the exact list above).
3. Add `_theme.sass` (semantic color only, `[data-theme]` light/dark).
4. `init` scaffolds: `index.sass`, `_tokens.sass` (color-only), `_theme.sass`,
   `_typography.sass`, `_globals.sass`, `_primitives.sass`, `_buttonslinks.sass`,
   `_mixins.sass` (internal-only).
5. Update `_mixins.sass` header: "internal to this package; apps use classes".
6. Pilot on fractalwiki (already closest): it uses radius12/radius16/radius20 in
   markup — confirm JIT emits them; then migrate other projects.

## Open questions

- Exact curated vocabulary list — freeze at 40–60 classes max, no more.
- Do `surface`/`panel`/`notice` deserve to exist, or are they `bdr + bg` compositions?
  (Lean: keep `surface`+`panel` as a11y/theme-safe pairs; kill the rest if unused.)
- Radius numeric classes: which values does real code use? (wiki: 4/8/12/16/20;
  design: 6/8/12; shradhapp: 3/6.) Proposal: registry supports any N, style
  guidance restricts to {4, 6, 8, 12, 16, 20, full} — but the JIT emits only what's used.
- Where does `--brand` live if apps must not re-scope scales? Answer: `_theme.sass`
  slot, per-project file `_brand.sass`, one line each.

---

## Audit: v2 vs Impeccable Skill vs FractalEngine codebase (2026-08-03)

Audited `apps/fractalengine` against this document and the Impeccable skill
(`/impeccable`). Three categories below: **conflicts** (docs disagree),
**violations** (codebase doesn't match either doc), and **gaps** (one doc is silent).

### Conflicts — the two docs can't both be right

**C1 — Radius ceiling.** v2 says `radius4/6/8/12/16/20/full`. Impeccable says
**"No Rounded Corners > 4px"** (max 4px, hard ban). Codebase already uses 7px,
8px, 10px, 999px. These cannot coexist. One must yield.
- **Recommendation:** Impeccable is authoritative for the IDE (FractalEngine is
  an IDE, not a marketing site). Shrink the v2 radius vocabulary to `radius4`
  max + `full` (avatar/pill exceptions). Document that the JIT scanner still
  emits any N — but style guidance restricts to {2, 4, full} for FractalEngine
  surfaces. Sites (fractalwiki, fractaldesign) may use the broader range if
  they don't run under Impeccable.

**C2 — Inline styles / `<style>` blocks.** v2 is silent on both. Impeccable
  explicitly bans both: **"No `<style>` blocks in `.svelte` files"** and
  **"Never use inline `style` attributes on HTML elements"**. Codebase has
  147 inline `style=` across 41 files and 3 `<style>` blocks. v2 needs to
  explicitly adopt these bans so the docs don't diverge silently.
- **Recommendation:** Add to v2 §2 Guidelines: "No `<style>` blocks in Svelte
  files — colocate `.sass` instead" and "No inline `style` attributes on
  HTML elements — use utility classes or `data-*` → SASS nesting."

### Codebase violations (both docs agree, codebase fails)

**V1 — Hardcoded colors.** Both docs: no hex in components, tokens only.
  Codebase: **99 `color: #` occurrences across 7 SASS files** (primarily
  `_commons.sass` and `apphealth.sass`). This is the highest-value cleanup.
- **Recommendation:** Migrate to `--text-primary/secondary`, `--theme-color`,
  `--background*`, `--feedback-error` tokens. Run a grep→replace pass on every
  `#` hex color in the SASS tree. Resolve any colors that don't have a token
  mapping by adding one to `_tokens.sass` under the appropriate theme block.

**V2 — Hand-rolled `data-slot` in app code.** v2 §5: "Apps should NOT hand-roll
  shadcn-style data-slot styling." Codebase: **32 `data-slot=` attributes**
  found in FractalEngine `.svelte` files. Some may be legitimate (fractalsvelte
  components use `data-slot` internally), but hand-rolled ones in app-authored
  markup violate the rule.
- **Recommendation:** Audit all 32 uses. Keep only those inside fractalsvelte
  component instances (consumer-side attribute passthrough). Remove hand-rolled
  `data-slot` from app components; replace with utility classes.

### Gaps (one doc covers, the other is silent)

**G1 — `--sz-*` spacing tokens.** v2 §1 says kill spacing variables outright
  ("No spacing variables"). Codebase has both: `--sz-*` tokens in `_tokens.sass`
  AND utility classes in `_primitives.sass` referencing those tokens.
  Impeccable is silent on this point.
- **Recommendation:** Follow v2. Remove `--sz-*` from `_tokens.sass` and
  `_primitives.sass`. Make gap/pad/margin classes emit fixed px/rem values
  directly (the fractals-styler JIT pattern). This removes a variable layer
  that the user explicitly rejected.

**G2 — No-gradient/no-blur/no-stripe.** Impeccable bans decorative gradient
  text, glassmorphism blurs, and colored side-stripe borders. v2 is silent.
  Codebase not yet audited for these but the risk is low in dev-tool UI.
- **Recommendation:** v2 should explicitly inherit Impeccable's design bans
  since it governs FractalEngine surfaces. Add: "No gradient text, no
  glassmorphism blurs, no colored side-stripe borders, no generic card grids."

### Quick-win actions (ordered by impact ÷ effort)

1. **Kill `--sz-*` spacing tokens** — remove from tokens + primitives, let
   fractals-styler JIT own spacing. Low effort, v2-mandated.
2. **Migrate hex colors to tokens** — 99 occurrences, mostly mechanical sed
   work. High impact for theming correctness.
3. **Ban inline styles + `<style>` blocks** — add to v2 guidelines, then
   run a lint pass. 147 inline + 3 blocks to fix.
4. **Resolve radius ceiling** — decide C1, then migrate all SASS `border-radius`
   values and any `radius*` utility classes to the chosen cap.
5. **Audit data-slot usage** — delete hand-rolled, keep library passthrough.
