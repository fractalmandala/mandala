# The Tailwind oracle

`scripts/oracle.mjs` compiles the **original** component with the real Tailwind v4 CLI and prints the exact CSS for every utility it uses. It is ground truth.

**Never translate a Tailwind class from memory.** `w-(--sidebar-width)`, `group-data-[collapsible=icon]:w-[calc(va (--sidebar-width-icon)+(--spacing(4))+2px)]`,`focus-visible:ring-ring/30` — these do not survive being guessed at, and every mistake is a silent visual bug that passes typecheck.

## Contents

- Running it
- Always pass --style
- Never copy --tw-* properties
- The icon-sizing clause hides at the end
- Variants with no base declarations
- Reading skin output

---

## Running it

```bash
# A component in shadcn-registry/
node scripts/oracle.mjs button --style luma

# Arbitrary classes — for sources outside the registry, or to check one utility
node scripts/oracle.mjs --class "size-4 md:flex data-[state=open]:rotate-180"

# Everything Tailwind emitted, unfiltered
node scripts/oracle.mjs button --style luma --raw

# A different palette
node scripts/oracle.mjs button --style luma --palette violet

# Skin classes whose name doesn't match the component (dropdown-menu → cn-menu-*)
node scripts/oracle.mjs dropdown-menu --style luma --skin-all
```

Output is two sections: **skin rules** (the visual design) and **structural utilities**.

---

## Always pass `--style`

A component's own utilities are almost entirely structural. Its colours, padding, radii and sizes live in the skin.

`button` is the proof: **13 structural utilities**, and every visual variant is a `cn-button-variant-*` class in `style-luma.css`. Port without `--style luma` and you get a correctly-shaped button with no colour, no padding and no sizes.

---

## Never copy `--tw-*` properties

Oracle output contains Tailwind's internal plumbing. Those custom properties do not exist in our stylesheet, so copying them produces rules that **silently do nothing**.

**Incorrect:**

```sass
	--tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 3px var(--tw-ring-color, currentcolor)
	box-shadow: var(--tw-inset-shadow), var(--tw-ring-shadow), var(--tw-shadow)
	--tw-translate-y: 1px
	translate: var(--tw-translate-x) var(--tw-translate-y)
```

**Correct:**

```sass
	box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 30%, transparent)
	translate: 0 1px
```

| Oracle emits                                                  | Write instead                                           |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| `--tw-ring-shadow: …; box-shadow: var(--tw-inset-shadow), …`  | `box-shadow: 0 0 0 Npx <color>` — or just `+focus-ring` |
| `--tw-translate-y: 1px; translate: var(--tw-translate-x) …`   | `translate: 0 1px`                                      |
| `border-style: var(--tw-border-style); border-width: 1px`     | `border: 1px solid transparent`                         |
| `--tw-font-weight: var(--font-weight-medium); font-weight: …` | `font-weight: 500`                                      |
| `line-height: var(--tw-leading, var(--text-sm--line-height))` | `line-height: var(--text-sm--line-height)`              |

**Rule of thumb: if a property name starts with `--tw-`, it does not belong in our SASS.** Resolve it to the value it stood in for. `color-mix()`, `@supports`, `oklch()` and `var(--our-token)` are all real CSS — keep those.

---

## The icon-sizing clause hides at the end

The base rule's `& svg:not([class*='size-'])` sits **after every state selector**, at the very bottom of a rule that can be 60 lines long. Reading the first 40 lines and concluding there isno icon sizing is a mistake that has already been made once — it shipped a 24px icon inside a 36px button.

```
.style-luma .cn-button {
  border-radius: var(--radius-4xl);
  …
  &[aria-invalid="true"] { … }
  &:is(.dark *) { … }
  & svg:not([class*='size-']) {     ← 60 lines down
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }
}
```

Search the output for `svg` before writing `+icon-child`. Pass the size explicitly:`+icon-child(1rem)`.

---

## Variants with no base declarations

A variant that only defines hover/state styles is not emitted as a nested block. Tailwind hoists it to a top-level selector, sometimes wrapped in `@media (hover: hover)`:

```
@media (hover: hover) {
  .style-luma .cn-button-variant-ghost:hover { … }
}
.style-luma .cn-button-variant-ghost[aria-expanded="true"] { … }
```

The oracle walks all top-level rules to catch these, so they appear in the report — but when scanning output by eye, **do not assume a variant is missing because it has no `.cn-x-variant-y {` block.** Search for the variant name, not the opening brace.

---

## Reading skin output

Skin rules are prefixed `.style-luma .cn-<name>…`. Map them:

| Skin class                   | Your selector               |
| ---------------------------- | --------------------------- |
| `.cn-button`                 | `[data-slot='button']`      |
| `.cn-button-variant-outline` | `&[data-variant='outline']` |
| `.cn-button-size-lg`         | `&[data-size='lg']`         |
| `.cn-card-header`            | `[data-slot='card-header']` |

Some components name skin classes differently from the component (`dropdown-menu` → `cn-menu-*`). If the report looks empty, re-run with `--skin-all` and filter by eye.

Only `luma` is ported so far. The other seven skins come later, as a batch, once the flattening is proven — do not port a second skin as part of a component port.
