# Design tokens

Every visual decision in the app shell flows from one of the token groups below.
Components never reference hex / rgba / hsl directly — they consume Sass tokens
in `src/lib/styles/_tokens.sass` or CSS custom properties exported by
`src/lib/styles/global.sass`.

## Layers

```
_tokens.sass       Sass-side tokens (raw values)
        ↓
_mixins.sass       Reusable mixins that consume tokens (focus-ring, scrollbar, ...)
        ↓
global.sass        :root CSS custom properties, theme variants, reset
        ↓
*.svelte <style>   Component styling consumes var(--ok-*) and @include mixins
```

The `--ok-*` namespace is the single source of truth that the
`pnpm run lint:tokens` rule enforces — no `#abc` / `rgb(...)` literals may
appear outside `_tokens.sass` / `_mixins.sass`.

## Color tokens

### Semantic palette (default / light)

| Sass token        | CSS variable       | Used for                                            |
|-------------------|--------------------|------------------------------------------------------|
| `$ink`            | `--ok-ink`         | Primary text                                         |
| `$ink-inverse`    | `--ok-ink-inverse` | Text on accent backgrounds                            |
| `$muted`          | `--ok-muted`       | Secondary text, helper text                           |
| `$muted-inverse`  | `--ok-muted-inverse` | Inverse muted text                                  |
| `$surface`        | `--ok-surface`     | Page background                                       |
| `$panel`          | `--ok-panel`       | Cards, dialogs, sidebar                               |
| `$line`           | `--ok-line`        | Hairlines, dividers, borders                          |
| `$accent`         | `--ok-accent`      | Selection, focus, brand accents                       |
| `$success`        | `--ok-success`     | Success states (alias of `$ok`)                       |
| `$danger`         | `--ok-danger`      | Destructive / error states                            |
| `$warn`           | `--ok-warn`        | Warning states                                        |
| `$ok`             | (alias of `$success`) | Backwards-compatible alias                         |
| `$light/dark/hc-panel-2` | `--ok-panel-2` | Secondary surface: kbd chips, inset wells      |

### Diff / activity panel tokens

| Sass token              | CSS variable         |
|-------------------------|----------------------|
| `$diff-added`           | `--ok-diff-added`    |
| `$diff-removed`         | `--ok-diff-removed`  |
| `$diff-modified`        | `--ok-diff-modified` |
| `$diff-context`         | `--ok-diff-context`  |
| `$diff-added-strong`    | `--ok-diff-added-strong`    |
| `$diff-removed-strong`  | `--ok-diff-removed-strong`  |
| `$diff-modified-strong` | `--ok-diff-modified-strong` |

### Highlight / selection

| Sass token           | CSS variable              |
|----------------------|---------------------------|
| `$highlight`         | `--ok-highlight`          |
| `$selection`         | `--ok-selection`          |
| `$selection-inverse` | `--ok-selection-inverse`  |
| `$focus-ring`        | `--ok-focus-ring`         |

### Overlay

| Sass token               | CSS variable                 |
|--------------------------|------------------------------|
| `$overlay-scrim`         | `--ok-overlay-scrim`         |
| `$overlay-shadow`        | `--ok-overlay-shadow`        |
| `$overlay-shadow-strong` | `--ok-overlay-shadow-strong` |
| `$shadow-sm` … `$shadow-xl` | `--ok-shadow-sm` … `--ok-shadow-xl` (composed from the overlay-shadow vars) |

Every entry in the three tables above has a per-theme value (`$light-*`,
`$dark-*`, `$hc-*` in `_tokens.sass`) published from the matching
`:root[data-theme="…"]` block in `global.sass`. Components must reference the
`var(--ok-*)` form so dark / high-contrast flips reach them at runtime.

## Theme variants

`global.sass` defines three theme variants and a "system" hook.

| Theme                 | Trigger                                                          |
|-----------------------|------------------------------------------------------------------|
| `:root[data-theme="light"]` | Default. Forces the light palette regardless of OS preference. |
| `:root[data-theme="dark"]`  | Forces the dark palette regardless of OS preference.         |
| `:root[data-theme="hc"]`    | High-contrast (WCAG AAA) palette with strong borders.        |
| `@media (prefers-contrast: more)` | AppShell resolves to `hc` whenever the OS asks for increased contrast, at any theme source. |
| `@media (prefers-color-scheme: dark)` | When the theme source is `system`, the OS scheme wins. |

The `preferences.ts` shell store carries the user's selected source and
AppShell flips `data-theme` on `<html>` in response, watching both
`prefers-color-scheme` and `prefers-contrast` for live OS changes.

## Radius tokens

| Sass token    | Value | Used for                                    |
|---------------|-------|----------------------------------------------|
| `$radius-xs`  | `2px` | Tag chips, micro details                       |
| `$radius-sm`  | `4px` | kbd-chip, small pills                          |
| `$radius-md`  | `6px` | Default for cards / panels                     |
| `$radius-lg`  | `8px` | Cards in dialogs                               |
| `$radius-xl`  | `12px`| Bottom sheets, large surfaces                  |
| `$radius-pill`| `999px`| Round avatar / status pills                  |

## Shadow tokens

| Sass token     | Used for                                              |
|----------------|-------------------------------------------------------|
| `$shadow-sm`   | Tiny elevation: chips, hover-state borders             |
| `$shadow-md`   | Default cards, menu surfaces                           |
| `$shadow-lg`   | Dialogs, palette, popovers                             |
| `$shadow-xl`   | Modal sheets, command palette backdrop                 |

## Z-index tokens

Layers are semantic. Use these instead of magic numbers.

| Sass token        | Purpose                |
|-------------------|------------------------|
| `$z-base`         | Document content        |
| `$z-elevated`     | Hover overlays          |
| `$z-sidebar`      | ShellSidebar            |
| `$z-toolbar`      | ShellToolbar, status    |
| `$z-popover`      | Popovers, tooltips     |
| `$z-dropdown`     | Dropdown menus          |
| `$z-toast`        | Toast stack             |
| `$z-palette`      | Command palette overlay |
| `$z-dialog`       | Modal dialogs           |
| `$z-tooltip`      | Tooltips (above all)    |

## Motion tokens

Durations and easings are exposed both as Sass variables (for hand-written
keyframes) and as the `motion-*` mixins.

| Sass token        | Value                      |
|-------------------|----------------------------|
| `$duration-instant` | `80ms`   |
| `$duration-fast`   | `120ms`  |
| `$duration-base`   | `180ms`  |
| `$duration-slow`   | `280ms`  |
| `$duration-slower` | `420ms`  |
| `$ease-out`        | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `$ease-in`         | `cubic-bezier(0.7, 0, 0.84, 0)` |
| `$ease-in-out`     | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `$ease-spring`     | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

`@media (prefers-reduced-motion: reduce)` collapses every transition to 0.01ms
in `global.sass`. Components should still reference `$duration-*` so the
override cascades consistently.

## Spacing scale

A 4px base grid. Tokens map directly to rem values.

| Sass token | Value |
|------------|-------|
| `$space-0` | `0`   |
| `$space-1` | `4px` |
| `$space-2` | `8px` |
| `$space-3` | `12px`|
| `$space-4` | `16px`|
| `$space-5` | `20px`|
| `$space-6` | `24px`|
| `$space-7` | `32px`|
| `$space-8` | `40px`|
| `$space-9` | `48px`|
| `$space-10`| `64px`|

## Typography

| Sass token           | Used for            |
|----------------------|---------------------|
| `$font-family-sans`  | Body, UI             |
| `$font-family-mono`  | Code, kbd chips      |
| `$font-size-xs`      | Helper labels        |
| `$font-size-sm`      | Secondary text       |
| `$font-size-base`    | Body                 |
| `$font-size-md`      | Inputs, dialogs      |
| `$font-size-lg`      | H3                   |
| `$font-size-xl`      | H2                   |
| `$font-size-2xl`     | H1                   |
| `$font-size-3xl`     | Marketing / hero     |

## Layout tokens

| Sass token                          | Value      |
|-------------------------------------|------------|
| `$shell-sidebar-min-width`          | `14.625rem`|
| `$shell-sidebar-max-width`          | `32rem`    |
| `$shell-sidebar-default-width`      | `18rem`    |
| `$shell-right-panel-min-width`      | `18rem`    |
| `$shell-right-panel-default-width`  | `22rem`    |
| `$shell-toolbar-height`             | `2.5rem`   |
| `$shell-statusbar-height`           | `1.5rem`   |
| `$shell-footer-height`              | `1.75rem`  |

## macOS title-bar reserve

| Sass token                  | CSS variable                  | Value                          |
|-----------------------------|-------------------------------|--------------------------------|
| `$ok-titlebar-reserve-left` | `--ok-titlebar-reserve-left`  | `5.25rem` (84px ≈ 86px) on macOS via `:root.platform-macos`; `1rem` elsewhere |
| `$ok-titlebar-reserve-top`  | `--ok-titlebar-reserve-top`   | `1.75rem` on all platforms     |

`ShellTitleBar.svelte` renders the strip at `--ok-titlebar-reserve-top` and
carries `data-tauri-drag-region` only when the bridge runtime is `tauri`; the
browser preview degrades to a static header band. AppShell sets the canonical
`.platform-macos` class on `<html>` (from `navigator.userAgentData` /
`navigator.platform`), which flips the left reserve to the macOS Sonoma+
traffic-light clearance (≈86px). `ShellToolbar` and `ShellSidebar` consume the
variable through `max(<default gutter>, var(--ok-titlebar-reserve-left))` so
the sidebar action cluster (New doc / New folder) and toolbar content never
slide under the OS traffic lights on macOS and keep their regular gutters
elsewhere.

## Mixins

`src/lib/styles/_mixins.sass` consumes the tokens above and exposes
component-friendly mixins.

| Mixin                | Purpose                                                         |
|----------------------|-----------------------------------------------------------------|
| `focus-ring($o, $s)` | Outline with the focus ring token; transitions color            |
| `divider($o, $t)`    | Hairline border-top / border-left using `--ok-line`              |
| `scrollbar($s, ...)` | Slim themed scrollbar matching shadcn/ui                        |
| `kbd-chip`           | Keycap visuals next to shortcuts                                |
| `panel($bg, $b)`     | Card surface (background, border, radius)                       |
| `overlay-surface($e)`| Modal / popover surface with elevation-specific shadow           |
| `press-feedback($s)` | Scale-on-press transition                                        |
| `hover-transition($p, $d)` | Color/background transition respecting reduced motion       |
| `focus-ring-reduced` / `press-feedback-reduced` / `hover-transition-reduced` | Reduced-motion overrides |

## Lint guard

`pnpm run lint:tokens` walks `src/` and fails the build when:

1. any Sass / scss / svelte / css file other than `_tokens.sass` /
   `_mixins.sass` contains a `#hex` literal or `rgb(...)` / `rgba(...)` /
   `hsl(...)` / `hsla(...)` call;
2. any `var(--ok-…)` / `var(--fk-…)` reference points at a custom property
   that is never defined in `global.sass` (catches typos like `--ok-ok` and
   dangling names like `--ok-overlay-surface`).

This enforces the contract:

- Add a new color to `_tokens.sass`.
- (Optional) alias it via a CSS custom property in `global.sass` under the
  appropriate theme block.
- Reference it from a component as `var(--ok-...)` (or via a mixin).

## WCAG audit (Group B.11)

Run `pnpm run test:e2e -- --grep contrast` to execute the live audit: it flips
`data-theme` through light / dark / hc, composites translucent backgrounds up
the ancestor chain, and asserts 4.5:1 for text (3:1 for the focus ring) on the
sidebar, editor, command palette, and settings dialog surfaces plus every
semantic token pair below.

Measured ratios (Playwright, rendered values):

| Pair                          | Light | Dark  | HC    |
|-------------------------------|-------|-------|-------|
| `--ok-ink` on `--ok-panel`    | 16.5  | 13.4  | 21.0  |
| `--ok-muted` on `--ok-panel`  | 5.5   | 6.2   | 14.7  |
| `--ok-accent` on `--ok-surface` | 5.5 | 7.6   | 7.8   |
| `--ok-success` on `--ok-surface` | 5.3 | 10.1  | 5.5   |
| `--ok-warn` on `--ok-surface` | 5.3   | 8.7   | 4.8   |
| `--ok-danger` on `--ok-surface` | 5.8 | 6.4   | 7.2   |
| `--ok-ink-inverse` on `--ok-accent` | 5.9 | 7.9 | 7.8  |
| `--ok-focus-ring` on `--ok-panel` (min 3:1) | 3.2 | 3.3 | 4.0 |

All pairs pass WCAG AA for text; the light status hues (`$success`, `$warn`,
`$danger`, `$accent`) and the light focus-ring alpha were re-tuned from the
source-app palette specifically to reach AA, and are the intentional divergence
recorded in the drift review. HC mode is AAA across the board.