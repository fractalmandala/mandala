---
title: Troubleshooting and FAQs
id: 29
group: others
description: "Common errors (the props gotcha, missing svelte.config.js, icon not animating)."
---

The errors below cover ~95% of "why isn't this working" cases. Walk them in order - most issues are caused by the first one or two.

## The icon renders but doesn't animate on hover

**Symptom:** icon shows up, no motion, no console errors.

**Cause 1 - `trigger` is something other than `'hover'`.** Default is `hover`, but if you've explicitly set `trigger="controlled"` (or `"mount"`), nothing will happen on hover.

```svelte
<!-- ✗ active is false → no animation -->
<Gear trigger="controlled" active={false} />

<!-- ✓ default behavior -->
<Gear />
```

**Cause 2 - the parent absorbs the hover.** A button or container with `pointer-events: none` on a child, or a covering element, will prevent the cursor from reaching the icon. Inspect the element with the browser dev tools and check whether `mouseenter` fires.

**Cause 3 - `prefers-reduced-motion`.** Some users have this set in their OS. See [Accessibility](/docs/27-accessibility).

**Cause 4 - `aria-hidden="true"` on a parent.** Some screen reader / browser combos suppress animations on hidden subtrees.

## `import { Gear } from 'svelte-animated-icon/phosphor'` fails

**Symptom:** `Failed to resolve import` or `Cannot find module`.

**Fix 1 - confirm the subpath exists in the version you installed.** Older versions may not have `./phosphor` yet. Check `package.json > exports`:

```json
{
  "exports": {
    ".":          { … },
    "./phosphor": { … }
  }
}
```

If `./phosphor` is missing, upgrade.

**Fix 2 - check your bundler resolves `svelte` exports.** Vite + the SvelteKit plugin do this automatically. Webpack needs `@sveltejs/vite-plugin-svelte` or equivalent. esbuild needs the `svelte` resolver.

**Fix 3 - the imports are case-sensitive.** `gear` ≠ `Gear`. Use the exact PascalCase.

## Animation plays but icons look broken

**Symptom:** paths are misaligned, missing, or weirdly sized.

**Fix - the SVG doesn't fit the 256 viewBox.** Most icon editors export with `viewBox="0 0 24 24"`. The library expects `0 0 256 256`. Either:

- Re-export from your source tool with a 256 viewBox, or
- Wrap the inner content in `<g transform="scale(10.67)">` as a quick fix.

See [Custom SVG Icons](/docs/21-guide-custom-svg) for the full story.

## `startAnimation()` is undefined

**Symptom:** trying to call `icon.startAnimation()` throws.

**Fix - bind:this returns the component instance in Svelte 5.** Make sure your target is a component, not a DOM element:

```svelte
<script>
  let icon = $state();
  // icon is the AnimatedIcon component instance, not the <svg> DOM node
</script>

<AnimatedIcon bind:this={icon} … />
<button onclick={() => icon.startAnimation()}>Go</button>
```

If you need the inner `<svg>` DOM element, wrap and bind the wrapper instead. See [Imperative Control](/docs/17-imperative-control).

## Looping animation won't stop

**Symptom:** `loop={true}` keeps running even after `active` flips to `false`.

**Fix - confirm `trigger="controlled"`.** `trigger="hover"` doesn't react to `active` at all; the animation runs from `mouseenter` to `mouseleave`. If you want a state-driven loop:

```svelte
<Gear trigger="controlled" active={isLoading} loop />
```

When `isLoading` flips to `false`, the effect cleanup cancels the animation. See [Autoplay and Looping](/docs/22-guide-autoplay-loop).

## TypeScript errors on `template`

**Symptom:** `Type '"draw"' is not assignable to type 'string'`.

**Fix - narrow the prop.** `template` is typed as `string` to allow forward compatibility with custom templates. If you want strict checking, narrow at the call site:

```ts
import { TEMPLATE_IDS } from 'svelte-animated-icon';

type TemplateId = (typeof TEMPLATE_IDS)[number];
const t: TemplateId = 'draw'; // ✓
const t2: TemplateId = 'spin'; // ✓
```

Or use `as const`:

```svelte
<Gear template={'draw' as const} />
```

See [TypeScript](/docs/28-typescript) for the full pattern.

## `style="animation-delay: …"` doesn't work as expected

**Symptom:** you've added a CSS `animation-delay` to an icon hoping to stagger it.

**Note:** the library uses **WAAPI**, not CSS animations. CSS `animation-delay` only affects CSS animations, not the WAAPI animations the icon runs.

For staggered WAAPI animations, either:

- Render separate icons, each with its own `trigger="controlled"` and `active` driven by a small delay in your state, or
- Use `speed` to scale the template's internal delay.

See [Speed](/docs/09-speed).

## The whole bundle feels too big

**Symptom:** build output includes more than you expected.

**Fix - check that you're importing from a subpath.** `import { Gear } from 'svelte-animated-icon'` (no `/phosphor`) won't work - the root export doesn't have icons. Make sure you're using the subpath.

**Fix - verify your bundler respects `sideEffects: false`.** Vite does by default. Webpack needs `mode: 'production'` and modern config. Check the package's `package.json`:

```json
"sideEffects": ["**/*.css"]
```

No JS is marked as having side effects, so bundlers should drop unused exports.

See [Tree Shaking](/docs/24-tree-shaking) for the full mechanism.

## Svelte 4 / Svelte 3 compatibility

The library uses `$props()`, `$state`, `$effect`, and the `.svelte.ts` file extension. None of these exist on Svelte 4 or 3.

**Required:** Svelte `^5.0.0`.

If you're on an older Svelte, either upgrade your app or use a different icon library.

## I changed a generated `.svelte` file and it disappeared

**Cause - codegen overwrites it.** The files in `src/lib/phosphor/icons/` are regenerated by `node scripts/generate.js`. Any manual edit is wiped on the next run.

**Fix - copy the icon out of the generated set** and edit the copy. See [Custom SVG Icons](/docs/21-guide-custom-svg).

## Where to get help

- Read [How It Works](/docs/23-how-it-works) for the engine's mental model.
- File an issue on the project's GitHub repository with a minimal reproduction.
- Check the [Templates Catalog](/docs/16-templates-catalog) to see if the animation you want already exists under a different name.