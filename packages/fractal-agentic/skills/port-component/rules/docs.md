# Documentation

One `.md` file plus one registry edit. There is no route to create.

## Contents

- Where things live
- Adding a page is two steps
- Page structure
- Never mention shadcn
- Examples are one tabbed area
- The props table
- Prose selectors must exclude data-slot
- Chrome conventions

---

## Where things live

```
src/content/components/<slug>.md        ← the page you write
src/lib/docs/registry.ts                ← nav, category, wave, status
src/lib/docs/*.svelte                   ← chrome: Preview, Examples, PropsTable, CodeBlock, Sidebar, Toc
src/routes/docs/components/[slug]/      ← ONE dynamic route, already wired
```

---

## Adding a page is two steps

1. Write `src/content/components/<slug>.md`.
2. Flip `status: "planned"` → `"ready"` in `src/lib/docs/registry.ts`.

`[slug]/+page.ts` resolves content with `import.meta.glob`, so the route appears by itself. A
registry entry with no `.md` renders a "not ported yet" placeholder and stays navigable.

Keep `deps` and `external` accurate in the registry — the sidebar and the placeholder read them.

---

## Page structure

```
<h1 class="doc-title">Name</h1>
<p class="doc-lede">One sentence.</p>

<Preview>            hero — the component at rest

## Installation      npm install AND copy-paste. We ship both.
## Usage             import + minimal example
## Examples          one <Examples> tabbed area
## Props             <PropsTable>
## Theming           the tokens this component reads
```

**Props comes after Examples.** People look for a working example first and reach for the API
reference second.

---

## Never mention shadcn

The docs never name it, never compare against it, and never carry a "differences" section.
This library stands on its own; where a component came from is an implementation detail.

Divergences are still recorded — in `ports/<name>.json`, which is internal and never rendered.

**Incorrect:**

```md
## Differences from shadcn

Unlike shadcn, this component exposes a `radius` prop instead of `class="rounded-full"`.
```

**Correct:**

```md
## Props

| radius | "none" | "sm" | … | Corner radius. Omit to keep the theme default. |
```

Same rule for prop-table badges: nothing marked "added" or "changed", because those only mean
something relative to a library we do not reference.

---

## Examples are one tabbed area

Not a stack of a dozen previews down the page. Write each demo as a snippet, pass them as items.

**Incorrect:**

```svelte
### Variants
<Preview code={codeVariants}>…</Preview>

### Sizes
<Preview code={codeSizes}>…</Preview>

### Disabled
<Preview code={codeDisabled}>…</Preview>
```

**Correct:**

```svelte
{#snippet demoVariants()}
	<Button>default</Button>
	<Button variant="outline">outline</Button>
{/snippet}

{#snippet demoSizes()}
	<Button size="sm">sm</Button>
{/snippet}

<Examples
	items={[
		{ title: 'Variants', demo: demoVariants, code: codeVariants },
		{ title: 'Sizes', demo: demoSizes, code: codeSizes, description: 'optional note' }
	]}
/>
```

Items are passed explicitly rather than registered by child components, so tab order is static
and cannot depend on render order. Keyboard nav (arrows, Home/End), roving focus and the ARIA
wiring live inside `Examples.svelte` — **do not reimplement them per page**.

Code strings are `const`s in the page's `<script>` block, not inline template literals in
attributes — multi-line literals inside markdown attributes are fragile.

---

## The props table

`<PropsTable {props} />` where `props: PropRow[]`. **Every prop belongs here** — with no class
escape hatch, an undocumented prop is an unusable one.

```ts
const props: PropRow[] = [
	{
		name: 'variant',
		type: '"default" | "outline"',
		default: '"default"',
		description: 'Visual style. Rendered as data-variant.'
	},
	{
		name: 'radius',
		type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
		description: 'Corner radius. Omit to keep the theme default.'
	}
];
```

Include `ref`, `children`, and any `child` snippet. Omit `default` for override props that
have none — the table renders an em dash.

Descriptions carry the non-obvious behaviour: that `textSize` beats `size`, that `disabled`
drops `href` on the anchor form, that a prop renders as a data attribute.

---

## Prose selectors must exclude `[data-slot]`

`docs.sass` styles `p`, `a`, `ul`, `code` inside `.doc-article`. A rendered component sits
inside that scope, so an unqualified prose rule leaks into it.

**Incorrect:**

```sass
.doc-article
	a
		text-decoration: underline
```

A `<Button href>` is an `<a>` — it renders underlined and link-coloured inside every preview.

**Correct:**

```sass
.doc-article
	a:not([data-slot], [data-slot] *)
		text-decoration: underline
```

**The guard must exclude descendants, not just the root.** `Card.Description` renders a `<p>`
_inside_ a component — a `:not([data-slot])` guard alone still matches it and applies the prose
margin. `:not([data-slot], [data-slot] *)` excludes the component and everything within it.

Every prose rule — `p`, `a`, `ul`, `li`, `code` — needs this guard. It is the single most
recurring docs bug: two of the first four components hit it.

---

## Chrome conventions

- **Radius is `var(--doc-r)` = 3px**, or `var(--doc-r-lg)` = 6px for large surfaces (preview
  frames, tables, cards, drawer). Nothing rounder.
- **No single-side accent borders.** They look wrong where the accent meets a rounded corner.
- Chrome lives in `src/lib/docs/`. Reuse it; don't write page-local components.
- Demo icons are inline `<svg>` — the library ships no icon dependency, and neither do its docs.
