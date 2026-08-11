# Extending `fractals-styler` with the CUBE CSS Methodology

This guide explains how to extend, scale, and add new capabilities to the `fractals-styler` system while adhering strictly to **CUBE CSS** (Composition · Utility · Block · Exception) principles.

---

## 1. Core Philosophy: Why CUBE CSS + `fractals-styler`?

Traditional utility-only frameworks (like pure Tailwind) lead to verbose HTML class bloat, while rigid BEM systems (`block__element--modifier`) fight against the CSS cascade. 

`fractals-styler` uses **CUBE CSS** to get the best of both worlds:
1. **Embrace the Cascade**: Global tokens and high-level composition do 80% of the styling work upfront.
2. **Lean Components**: Blocks (components) remain small (under 50–80 lines of SASS) because layout, typography, and state are handled by other layers.
3. **DRY & Scalable**: Single-responsibility JIT utilities handle micro-spacing and alignment without duplicating CSS.
4. **Data-Driven Exceptions**: Component states and variants use native HTML attributes (`data-*` and `aria-*`) instead of modifier classes (`.btn--active`).

---

## 2. The 4 Layers of CUBE CSS in `fractals-styler`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CUBE CSS LAYERS                            │
├─────────────────┬─────────────────┬──────────────────┬──────────────────┤
│ C - Composition │  U - Utility    │    B - Block     │  E - Exception   │
├─────────────────┼─────────────────┼──────────────────┼──────────────────┤
│ Macro Layouts   │ JIT Spacing     │ Lean Components  │ Data Attributes  │
│ Skeleton & Flow │ Design Tokens   │ Cards, Buttons   │ State & Variants │
│ _compositions   │ _tokens, JIT    │ _buttonslinks    │ [data-variant]   │
└─────────────────┴─────────────────┴──────────────────┴──────────────────┘
```

---

### Layer 1: Composition (Macro Layouts & Flow)

The **Composition** layer controls layout arrangement, spatial rhythm, and skeletal structure across elements. 

#### Rules for Composition:
- **Arrangement ONLY**: Defines grid rails, flex gaps, max-widths, and margins.
- **ZERO Visual Styling**: Must NOT contain background colors, box shadows, borders, or font family overrides.
- **Content Agnostic**: Handles how elements sit next to each other regardless of what component is inside.

#### File Location:
`src/lib/styles/_compositions.sass` (and `<AppShell>`)

#### How to Extend Composition:
When adding a new macro layout (e.g., a `.split-hero` or `.grid-auto-fit`):

1. **Define Layout Tokens in `_tokens.sass`**:
   ```sass
   :root
     --hero-min-height: 480px
     --grid-min-col: 280px
   ```

2. **Add the Composition Rule in `_compositions.sass`**:
   ```sass
   /* Auto-fit responsive grid without media queries */
   .grid-auto-fit
     display: grid
     grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-col, 280px), 1fr))
     gap: var(--px24, 24px)

   /* Vertical stack rhythm helper */
   .flow > * + *
     margin-top: var(--flow-space, 1em)
   ```

---

### Layer 2: Utility (JIT & Design Tokens)

Utilities are single-responsibility classes that do one job exceptionally well. In `fractals-styler`, utilities are divided into **Static Design Tokens** (SASS) and **JIT Numeric Utilities** (Vite Plugin).

#### Rules for Utilities:
- **Single Property Scoped**: A class should modify only 1 (or a tightly coupled group of) CSS properties.
- **Design Token Integration**: Use custom properties (`var(--background10)`, `var(--border)`) rather than hardcoded hex values.

#### File Locations:
- `src/lib/styles/_tokens.sass` (Variables & color tokens)
- `src/lib/styles/_typography.sass` (Font sizes & weights)
- `src/lib/styles/_primitives.sass` (Radius tokens `.radius2`..`.radiusfull`)
- `packages/fractals-styler/src/plugin.ts` (JIT matcher engine)

#### How to Extend Utilities:

##### A. Adding Static Utilities & Tokens (`_tokens.sass` & `_typography.sass`)
Add brand variables to `:root` and create matching single-purpose token utility classes:

```sass
/* _tokens.sass */
:root
  --brand-primary: #2563eb
  --brand-surface: #f8fafc

.bg-brand
  background-color: var(--brand-primary)

.color-brand
  color: var(--brand-primary)
```

##### B. Extending the JIT Plugin (Vite JIT Engine)
If you need a new numeric utility prefix (for example, `.zN` for `z-index` or `.opacityN` for `opacity`), update the matcher in `packages/fractals-styler/src/plugin.ts`:

```ts
// 1. Add pattern to class matcher regex
const UTILITY_REGEX = /^(gap|pad|margin|width|height|minw|maxw|minh|maxh|z|opacity)(\d+)(-(sm|md|lg|xl))?$/;

// 2. Add generator rule in CSS emitter function
case 'z':
  return `z-index: ${num};`;
case 'opacity':
  return `opacity: ${num / 100};`;
```

---

### Layer 3: Block (Lean Components)

A **Block** is a standalone component (e.g. Card, Button, Avatar, Panel). Because global CSS, compositions, and utilities do most of the heavy lifting, **Blocks in CUBE CSS are extremely lightweight**.

#### Rules for Blocks:
- **Max 50–80 Lines**: If a block SASS file exceeds 80 lines, you are over-specifying styles that should belong to global typography or utilities.
- **No Deep BEM Chains**: Avoid `.card__header__title__icon`. Style direct element structures (`.card header h3`) or rely on child utilities.
- **Cascade Friendly**: Allow typography and color inheritance to flow down from parent containers.

#### File Location:
`src/lib/styles/_buttonslinks.sass` or component-specific SASS files (`.card`, `.avatar`, `.badge`).

#### How to Extend Blocks:
Add new component primitives to `_primitives.sass` or `_buttonslinks.sass`:

```sass
/* _primitives.sass */
.card
  background-color: var(--background10)
  border: 1px solid var(--border)
  border-radius: var(--radius8, 8px)
  overflow: hidden
  transition: border-color 0.2s ease, box-shadow 0.2s ease

  /* Internal structure uses element selectors or composition helpers */
  > header
    padding: var(--px16)
    border-bottom: 1px solid var(--border)

  > section
    padding: var(--px16)
```

---

### Layer 4: Exception (State & Variant Attributes)

**Exceptions** handle state changes, variants, and deviations from standard Block behavior. 

#### Core CUBE Rule for Exceptions:
**Do NOT use modifier classes** like `.button--primary` or `.card--active`. Instead, **use HTML `data-*` attributes and `aria-*` states**.

#### Why Data Attributes?
- **Platform Native**: Bridges HTML, CSS, and JS/Svelte 5 runes (`$state()`) seamlessly.
- **Accessible**: Works directly with ARIA states (`[aria-current="page"]`, `[aria-expanded="true"]`).
- **No Class Thrashing**: Toggling state in Svelte is as simple as `data-state={active}` rather than complex class string concatenation.

#### How to Add Exceptions:

```sass
/* _buttonslinks.sass */
.button
  background-color: var(--button-bg, #f1f5f9)
  color: var(--button-color, #0f172a)
  border: 1px solid transparent

  /* Exception variants via data-variant */
  &[data-variant="primary"]
    background-color: var(--brand-primary)
    color: #ffffff

  &[data-variant="ghost"]
    background-color: transparent
    color: var(--brand-primary)
    border-color: var(--border)

  /* Exception states via data-state / aria-* */
  &[data-state="loading"]
    opacity: 0.7
    pointer-events: none

  &[aria-disabled="true"]
    opacity: 0.5
    cursor: not-allowed
```

---

## 3. Class Grouping Convention in Markup

With CUBE CSS, an HTML element often has multiple classes representing its **Block**, **Composition**, and **Utilities**. To maintain clean, readable markup in Svelte templates, use **Square Brackets `[ ]`** or **Pipes `|`**:

### Grouping Order Standard:
`[ Block ] [ Composition / Layout ] [ Utilities & Design Tokens ]`

```svelte
<!-- Example 1: Using Square Brackets -->
<article
  class="[ card ] [ flow gap16 ] [ bg-surface pad24 radius12 ]"
  data-variant="featured"
  data-state="active"
>
  <h3 class="text-lg bold">Card Title</h3>
  <p class="text-sm color-muted">Card description content...</p>
</article>

<!-- Example 2: Using Pipes -->
<button
  class="button | row ycenter gap8 | pad12 pad16-md radius6"
  data-variant="primary"
  onclick={handleSave}
>
  <span>Save Changes</span>
</button>
```

---

## 4. Step-by-Step Walkthrough: Adding a New CUBE Feature to `fractals-styler`

Let's build a new **`Banner`** component system from scratch following CUBE principles:

### Step 1: Define Tokens (`_tokens.sass`)
```sass
:root
  --banner-info-bg: #eff6ff
  --banner-info-border: #bfdbfe
  --banner-info-text: #1e40af
```

### Step 2: Write Lean Block + Exception SASS (`_primitives.sass`)
```sass
.banner
  display: flex
  align-items: center
  gap: var(--px12, 12px)
  padding: var(--px16, 16px)
  border-radius: var(--radius8, 8px)
  border: 1px solid transparent

  /* Exception Variants via Data Attributes */
  &[data-variant="info"]
    background-color: var(--banner-info-bg)
    border-color: var(--banner-info-border)
    color: var(--banner-info-text)

  &[data-variant="warning"]
    background-color: #fffbeb
    border-color: #fde68a
    color: #92400e
```

### Step 3: Implement in Svelte 5 with CUBE Grouping
```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    variant?: 'info' | 'warning';
    children?: Snippet;
  };

  let { variant = 'info', children }: Props = $props();
</script>

<aside
  class="[ banner ] [ row ycenter gap12 ] [ pad16 radius8 ]"
  data-variant={variant}
  role="alert"
>
  {@render children?.()}
</aside>
```

---

## 5. Anti-Patterns & Checklist

| Anti-Pattern to Avoid | Correct CUBE CSS Practice |
| :--- | :--- |
| **BEM Class Chains** (`.card__header__title--large`) | Lean block (`.card header h3`) + utility class (`.text-lg`). |
| **Modifier Classes** (`.btn--primary`, `.btn--disabled`) | Data attributes (`[data-variant="primary"]`, `[aria-disabled="true"]`). |
| **Visuals in Composition** (Adding background/shadow to `.stack` or `.appbody`) | Composition handles arrangement only. Apply background/shadow via Block or Utility. |
| **Un-grouped Markup** (`class="card stack pad24 bg-base bold text-lg"`) | Group classes using `[ Block ] [ Composition ] [ Utilities ]`. |
| **Bypassing Cascade** (Hardcoding fonts/colors in every component) | Inherit global typography and color custom properties from `:root`. |
