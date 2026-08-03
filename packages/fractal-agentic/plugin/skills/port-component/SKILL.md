---
name: port-component
description: Ports a shadcn-svelte (or any Svelte/Tailwind) component into the fractalsvelte library — converting Tailwind utilities to indented SASS, tailwind-variants matrices to typed props, and generating the documentation page and route. Use when asked to "port", "convert", "bring in", or "create our version of" any component or block. Applies to anything in shadcn-registry/, a registry URL, or a pasted component.
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(node scripts/oracle.mjs *), Bash(node scripts/gen-palette.mjs *), Bash(pnpm check*), Bash(npx sass *), Bash(pnpm dev*)
---

# port-component

End-to-end porting of a component into **fractalsvelte** — a standalone Svelte 5 + SASS component library. No Tailwind, no class-string merging, no `cn()`. Everything a consumer can change is a typed prop or a CSS custom property.

Invoke as `/port-component <name>` or "port the accordion component".

---

## What porting means here

The source component expresses its design three ways. All three must be converted:

| Source                                             | Becomes                                             |
| -------------------------------------------------- | --------------------------------------------------- |
| Tailwind utilities in `class={cn(...)}`            | declarations in `<name>.sass`, keyed on `data-slot` |
| `tv()` / `cva()` variant matrix                    | typed props rendered as `data-*` attributes         |
| `cn-*` skin classes (`@apply` in `style-luma.css`) | the component's actual colours, padding and sizes   |

**The skin is not optional.** A component's own utilities are almost entirely structural — `button` has 13 structural utilities and every visual variant lives in the skin. Port without it and you get a correctly-shaped, entirely unstyled component.

---

## Step 0 — Locate the source and check dependencies

```bash
ls shadcn-registry/docs/lib/registry/ui/<name>/
grep -rhE "^\s*import" shadcn-registry/docs/lib/registry/ui/<name>/*.svelte
```

Classify every import:

| Import                                               | Action                                                           |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| `$lib/utils.js` (`cn`, type helpers)                 | types come from `$lib/utils.js`; **`cn` is dropped**             |
| `$lib/registry/ui/<other>`                           | a dependency — **it must already be ported**                     |
| `tailwind-variants`                                  | dropped → becomes props (see [rules/props.md](./rules/props.md)) |
| `bits-ui`, `vaul-svelte`, `paneforge`, `formsnap`, … | **kept** — headless behaviour, not styling                       |
| `svelte`, `svelte/elements`                          | kept                                                             |
| `@lucide/svelte` or any icon                         | dropped → the consumer passes icons as children                  |

If an internal dependency is not ported, **stop and port that first**. Check `src/lib/docs/registry.ts` for status and wave order. Never stub a dependency you could port.

**Source is not in `shadcn-registry/`?** (a URL, another repo, a pasted file) Everything below still applies except the oracle's `<name>` form — use `node scripts/oracle.mjs --class "…"` with the component's utility strings instead. Note the origin in the ledger.

## Step 1 — Read the examples before writing any code

```bash
ls shadcn-registry/docs/lib/registry/examples/ | grep '^<name>'
```

**This step is not optional and not last.** shadcn assumes `class` is always available as an escape hatch, so components are systematically under-propped. `Skeleton` has _zero_ props upstream because every documented use is `class="h-4 w-[250px]"`. Ported literally it cannot express a size and is useless.

Anything the examples set through `class` — geometry, colour, shape, casing — has to become a real prop. See [rules/props.md](./rules/props.md).

The examples are also the **acceptance criteria**: the component is not ported until they render.

## Step 2 — Ask the oracle. Never translate Tailwind from memory

```bash
node scripts/oracle.mjs <name> --style luma
```

Ground truth for every utility, including arbitrary values, `group-data-*` variants, media queries and `@apply` resolution. Reading its output correctly has real traps — the `--tw-*` plumbing must never be copied, and the base rule's icon-sizing clause hides at the very end. Read [rules/oracle.md](./rules/oracle.md) before interpreting output.

## Step 3 — Write the component

`src/lib/components/<name>/<name>.svelte` — see [rules/markup.md](./rules/markup.md) and [templates/component.svelte](./templates/component.svelte).

Markup carries `data-slot` and `data-*` variant attributes and **nothing else**. No `class` attribute, no `cn()`, no layout classes.

## Step 4 — Write the styles

`src/lib/components/<name>/<name>.sass` — see [rules/styles.md](./rules/styles.md) and [templates/component.sass](./templates/component.sass).

Indented SASS, single tab, no braces, no semicolons. Register it in `src/lib/styles/index.sass`.

## Step 5 — Write the docs page

`src/content/components/<name>.md` — see [rules/docs.md](./rules/docs.md) and [templates/page.md](./templates/page.md).

Then flip `status` to `"ready"` in `src/lib/docs/registry.ts`. **There is no route to create** — `src/routes/docs/components/[slug]/` resolves content by glob.

## Step 6 — Write the ledger

`ports/<name>.json` — see [reference/ledger.md](./reference/ledger.md). Records every prop you invented and every deliberate deviation. This is internal; it never appears in the docs.

## Step 7 — Verify

```bash
pnpm check                                                   # 0 errors, 0 warnings
npx sass --load-path=src/lib/styles src/lib/styles/index.sass /tmp/c.css
pnpm dev --port 5199                                         # then look at the page
```

Run through [reference/checklist.md](./reference/checklist.md). **Look at the rendered page in a browser, in light and dark.** Compiling is not evidence that it looks right — every bug found during the pilot ports was visual and passed typecheck.

---

## Critical rules

Each links to a file with Incorrect/Correct pairs.

### Markup → [rules/markup.md](./rules/markup.md)

- **No `class` attribute on the component's own elements.** `data-slot` is the styling hook.
- **No `cn()`, `clsx`, `tailwind-merge`, `tailwind-variants`.**
- **Svelte 5 runes only.** `$props`, `$state`, `$derived`, `$bindable`. Never `$:` or stores.
- **Write `$derived(expr)`, never `$derived(() => expr)`.**
- **`ref` is `$bindable(null)`** and bound with `bind:this`.
- **Icons are children, never imports.** The library ships no icon dependency.
- **Multi-part components keep the folder + `index.ts` barrel** shape.

### Props → [rules/props.md](./rules/props.md)

- **Every `tv()` variant axis becomes a typed prop** with a default, rendered as `data-*`.
- **Shared vocabulary comes from `$lib/types.js`** — `Radius`, `TextSize`, `TextTransform`.
  Never redefine a radius scale per component.
- **Read the examples; invent props for anything they did through `class`.**
- **Record invented props in the ledger.**

### Styles → [rules/styles.md](./rules/styles.md)

- **Indented SASS. No braces, no semicolons, single-tab.** No `<style>` blocks, ever.
- **Tokens only.** `var(--muted-foreground)`, never a hardcoded colour.
- **Use the mixins** — `+interactive`, `+focus-ring`, `+icon-child`, `+invalid-ring`,
  `+radius-variants`, `+text-size-variants`, `+bp-*`. Don't re-declare what they cover.
- **Shared prop mixins go last**, after the component's own size rules — source order decides.
- **Central vs colocated is by measured frequency**, not taste: 5+ components → central.
- **Never copy a `--tw-*` property.**

### Docs → [rules/docs.md](./rules/docs.md)

- **Never mention shadcn.** No comparisons, no "differences" section. Divergences go in the ledger, which is internal.
- **Examples are one `<Examples>` tabbed area**, not a stack of previews.
- **Props section comes after Examples.**
- **Prose selectors exclude `[data-slot]`** — see the file for why.

---

## Key patterns

```svelte
<script lang="ts" module>
	import type { Radius } from '$lib/types.js';
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type CardVariant = 'default' | 'outline';

	export type CardProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: CardVariant;
		radius?: Radius;
	};
</script>

<script lang="ts">
	let {
		variant = 'default',
		radius,
		ref = $bindable(null),
		children,
		...restProps
	}: CardProps = $props();
</script>

<!-- data-slot is the styling hook. No class attribute. -->
<div bind:this={ref} data-slot="card" data-variant={variant} data-radius={radius} {...restProps}>
	{@render children?.()}
</div>
```

```sass
@use '../../styles/mixins' as *

[data-slot='card']
	display: flex
	flex-direction: column
	background-color: var(--card)
	color: var(--card-foreground)
	border: 1px solid var(--border)
	+radius('lg')

	&[data-variant='outline']
		background-color: transparent

	// Shared prop mixins last — they must beat the rules above on source order.
	+radius-variants
```

---

## Porting a block

Blocks (`shadcn-registry/docs/lib/registry/blocks/`) are compositions, not new components.

1. Every component the block uses must be ported first — check `registry.ts`.
2. Layout wrappers (`flex items-center gap-2`) become `.box` / `.row` classes from `_layouts.sass`. **This is the one place those classes are used** — never inside a component's own markup.
3. Blocks live in `src/routes/blocks/<name>/` and are demonstrated, not published.
4. A block needs no ledger, but note any component gap it exposed.

---

## Reference

- [rules/markup.md](./rules/markup.md) — runes, data-slot, snippets, refs, icons, barrels
- [rules/props.md](./rules/props.md) — tv() conversion, shared enums, inventing props
- [rules/styles.md](./rules/styles.md) — indented SASS, mixins, tokens, central vs colocated
- [rules/oracle.md](./rules/oracle.md) — running and reading the Tailwind oracle
- [rules/docs.md](./rules/docs.md) — page structure, Examples tabs, PropsTable, registry
- [reference/checklist.md](./reference/checklist.md) — definition of done
- [reference/ledger.md](./reference/ledger.md) — `ports/<name>.json` schema
- [reference/tokens.md](./reference/tokens.md) — the 32 tokens and what reads them
- `AGENTS.md` at the package root — project-wide conventions beyond porting
