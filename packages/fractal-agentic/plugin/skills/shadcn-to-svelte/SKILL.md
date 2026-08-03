---
name: 'component-to-svelte'
description: 'Studies a project component folder (files, guide.md, index.ts) and generates a standalone .svelte component using Svelte 5 runes, TypeScript, and pure indented Sass. Invoke when user provides a path and asks to extract/convert a component into standalone form.'
---

# Component-to-Svelte: Extract Project Component to Standalone .svelte

Given a path to a component directory inside a project (e.g., `/Users/amrit/Documents/GitHub/ai-elements-master/src/lib/components/ai-elements/prompt-input`), this skill reads all files recursively, studies the `guide.md` and `index.ts`, analyzes the component structure, and produces a **standalone `.svelte` file** that:

- Uses **Svelte 5 runes** (`$state`, `$derived`, `$derived.by`, `$effect`, `$props`, `$bindable`)
- Uses **TypeScript** in `<script lang="ts">`
- Has **all styling inline** inside `<style lang="sass">` using **pure indented Sass** (single-tab indent, no braces, no semicolons/colons)
- Has **zero external CSS/framework dependencies** — no Tailwind, no shadcn, no bits-ui
- Is fully **self-contained and portable** to any Svelte 5 project

## Workflow

### Step 1: Discover the component structure

Given a directory path, recursively list all files and folders. The typical structure:

```
<component-dir>/
├── guide.md              # Usage guide describing composition order
├── index.ts              # Public API — re-exports all sub-components
├── core/
│   ├── root.svelte       # Root/wrapper component
│   └── provider.svelte   # Context provider (if applicable)
├── context/              # (optional) Svelte context / rune-based state
│   ├── types.ts
│   ├── provider.svelte.ts
│   └── attachments.svelte.ts
├── controls/             # (optional) Buttons, textareas, inputs
├── layout/               # (optional) Header, body, toolbar shells
├── attachments/          # (optional) File/attachment UI
└── action-menu/          # (optional) Dropdown menus
```

**Read these key files first (in this order):**

1. **`guide.md`** — Understand the intended composition (which sub-components wrap which, ordering)
2. **`index.ts`** — Understand the full public API: every exported component name, context function, and type. The naming aliases (e.g., `Root as PromptInput`) tell you the intended public names
3. **`context/types.ts`** (if present) — Understand the core data types, interfaces, and state shapes
4. **All `.svelte` files** — Analyze each for props, state, events, slots, styling classes

### Step 2: Analyze each Svelte file

For each `.svelte` file, extract:

#### Props interface

Look at the `interface Props` block. Convert each prop into `$props()` or `$bindable()`:

- Required props → destructure directly in `$props()`
- Optional props with defaults → default in destructure
- Two-way bound props (e.g., `value`, `ref`) → use `$bindable()`
- `class` prop → rename to `className` internally, map to root element
- `children` prop → type as `import("svelte").Snippet` and render with `{@render children()}`

#### Reactive state

- `$state(...)` for local mutable state
- `$state.raw(...)` for objects/arrays that don't need deep reactivity
- `$derived(...)` and `$derived.by(...)` for computed values
- `$effect(...)` for side effects (watching prop changes, registering callbacks)
- Use `untrack(...)` from `svelte` when an effect dependency should NOT cause re-run

#### Component composition / slots

- Sub-components rendered as children via snippet `{@render children()}`
- Snippet props for named slots: `{@render header()}`, `{@render body()}`
- Element references: `let el = $state<HTMLElement | null>(null)` used with `bind:this={el}`

#### Events

- Svelte 5 uses callback props instead of `createEventDispatcher`
- Look for `onclick`, `onkeydown`, `onsubmit`, etc. as prop callbacks
- Type them correctly in the Props interface

#### Styling classes (Tailwind → Sass conversion)

This is the most important conversion. Map every Tailwind utility class to its equivalent CSS:

**Layout:**

| Tailwind          | CSS                                   |
| ----------------- | ------------------------------------- |
| `flex`            | display: flex                         |
| `flex-col`        | flex-direction: column                |
| `flex-row`        | flex-direction: row                   |
| `items-center`    | align-items: center                   |
| `items-start`     | align-items: flex-start               |
| `items-end`       | align-items: flex-end                 |
| `justify-between` | justify-content: space-between        |
| `justify-center`  | justify-content: center               |
| `justify-end`     | justify-content: flex-end             |
| `gap-1`           | gap: 4px                              |
| `gap-2`           | gap: 8px                              |
| `gap-3`           | gap: 12px                             |
| `gap-4`           | gap: 16px                             |
| `gap-6`           | gap: 24px                             |
| `grid`            | display: grid                         |
| `grid-cols-2`     | grid-template-columns: repeat(2, 1fr) |
| `space-x-2`       | > * + * { margin-left: 8px }          |
| `space-y-2`       | > * + * { margin-top: 8px }           |

**Sizing:**

| Tailwind       | CSS                              |
| -------------- | -------------------------------- |
| `w-full`       | width: 100%                      |
| `w-fit`        | width: fit-content               |
| `h-full`       | height: 100%                     |
| `h-auto`       | height: auto                     |
| `max-w-md`     | max-width: 28rem                 |
| `max-w-lg`     | max-width: 32rem                 |
| `min-h-0`      | min-height: 0                    |
| `size-4`       | width: 16px; height: 16px        |
| `size-5`       | width: 20px; height: 20px        |
| `size-6`       | width: 24px; height: 24px        |
| `size-8`       | width: 32px; height: 32px        |
| `size-10`      | width: 40px; height: 40px        |
| `w-<n>` (1-96) | width: n*4px (e.g., w-10 = 40px) |
| `h-<n>` (1-96) | height: n*4px                    |

**Spacing (padding/margin):**

| Tailwind  | CSS                                     |
| --------- | --------------------------------------- |
| `p-0`     | padding: 0                              |
| `p-1`     | padding: 4px                            |
| `p-2`     | padding: 8px                            |
| `p-3`     | padding: 12px                           |
| `p-4`     | padding: 16px                           |
| `p-6`     | padding: 24px                           |
| `px-2`    | padding-left: 8px; padding-right: 8px   |
| `px-4`    | padding-left: 16px; padding-right: 16px |
| `py-1`    | padding-top: 4px; padding-bottom: 4px   |
| `py-2`    | padding-top: 8px; padding-bottom: 8px   |
| `pl-2`    | padding-left: 8px                       |
| `pr-2`    | padding-right: 8px                      |
| `pt-2`    | padding-top: 8px                        |
| `pb-2`    | padding-bottom: 8px                     |
| `m-0`     | margin: 0                               |
| `m-2`     | margin: 8px                             |
| `mx-auto` | margin-left: auto; margin-right: auto   |
| `my-2`    | margin-top: 8px; margin-bottom: 8px     |
| `mt-1`    | margin-top: 4px                         |
| `mt-2`    | margin-top: 8px                         |
| `mb-2`    | margin-bottom: 8px                      |
| `ml-auto` | margin-left: auto                       |
| `mr-2`    | margin-right: 8px                       |

**Typography:**

| Tailwind              | CSS                                                            |
| --------------------- | -------------------------------------------------------------- |
| `text-xs`             | font-size: 12px                                                |
| `text-sm`             | font-size: 14px                                                |
| `text-base`           | font-size: 16px                                                |
| `text-lg`             | font-size: 18px                                                |
| `text-xl`             | font-size: 20px                                                |
| `text-2xl`            | font-size: 24px                                                |
| `font-normal`         | font-weight: 400                                               |
| `font-medium`         | font-weight: 500                                               |
| `font-semibold`       | font-weight: 600                                               |
| `font-bold`           | font-weight: 700                                               |
| `leading-tight`       | line-height: 1.25                                              |
| `leading-relaxed`     | line-height: 1.625                                             |
| `text-center`         | text-align: center                                             |
| `text-left`           | text-align: left                                               |
| `text-right`          | text-align: right                                              |
| `truncate`            | overflow: hidden; text-overflow: ellipsis; white-space: nowrap |
| `whitespace-pre-wrap` | white-space: pre-wrap                                          |
| `text-balance`        | text-wrap: balance                                             |
| `break-words`         | overflow-wrap: break-word                                      |
| `list-disc`           | list-style-type: disc                                          |

**Colors (map shadcn CSS vars to HSL):**

| Tailwind/shadcn token         | CSS                                                      |
| ----------------------------- | -------------------------------------------------------- |
| `bg-background`               | background-color: hsl(var(--bg))                         |
| `bg-secondary`                | background-color: hsl(var(--bg-secondary))               |
| `bg-muted`                    | background-color: hsl(var(--bg-muted))                   |
| `bg-accent`                   | background-color: hsl(var(--bg-accent))                  |
| `bg-destructive`              | background-color: hsl(var(--bg-destructive))             |
| `bg-card`                     | background-color: hsl(var(--bg-card))                    |
| `bg-popover`                  | background-color: hsl(var(--bg-popover))                 |
| `text-foreground`             | color: hsl(var(--fg))                                    |
| `text-muted-foreground`       | color: hsl(var(--fg-muted))                              |
| `text-secondary-foreground`   | color: hsl(var(--fg-secondary))                          |
| `text-accent-foreground`      | color: hsl(var(--fg-accent))                             |
| `text-destructive-foreground` | color: hsl(var(--fg-destructive))                        |
| `text-primary`                | color: hsl(var(--primary))                               |
| `text-card-foreground`        | color: hsl(var(--fg-card))                               |
| `text-popover-foreground`     | color: hsl(var(--fg-popover))                            |
| `border`                      | border-color: hsl(var(--border))                         |
| `border-input`                | border-color: hsl(var(--border-input))                   |
| `ring-offset-background`      | --ring-offset-color: hsl(var(--bg))                      |
| `focus-visible:ring-ring`     | outline: 2px solid hsl(var(--ring)); outline-offset: 2px |

**Define CSS custom properties for the component's scope:**

```sass
--bg: 0 0% 100%           // white
--fg: 222 47% 11%         // dark navy text
--bg-muted: 210 40% 96%   // light gray bg
--fg-muted: 215 16% 47%   // medium gray text
--bg-secondary: 210 40% 96%
--fg-secondary: 222 47% 11%
--bg-accent: 210 40% 96%
--fg-accent: 222 47% 11%
--bg-destructive: 0 84% 60%
--fg-destructive: 210 40% 98%
--bg-card: 0 0% 100%
--fg-card: 222 47% 11%
--bg-popover: 0 0% 100%
--fg-popover: 222 47% 11%
--border: 214 32% 91%
--border-input: 214 32% 91%
--ring: 222 47% 11%
--radius: 8px
--radius-sm: 6px
--radius-lg: 12px
```

**Borders & Radius:**

| Tailwind       | CSS                                         |
| -------------- | ------------------------------------------- |
| `border`       | border: 1px solid hsl(var(--border))        |
| `border-0`     | border: 0                                   |
| `border-b`     | border-bottom: 1px solid hsl(var(--border)) |
| `border-t`     | border-top: 1px solid hsl(var(--border))    |
| `border-l`     | border-left: 1px solid hsl(var(--border))   |
| `border-r`     | border-right: 1px solid hsl(var(--border))  |
| `rounded`      | border-radius: var(--radius)                |
| `rounded-sm`   | border-radius: var(--radius-sm)             |
| `rounded-lg`   | border-radius: var(--radius-lg)             |
| `rounded-md`   | border-radius: calc(var(--radius) - 2px)    |
| `rounded-full` | border-radius: 9999px                       |
| `rounded-xl`   | border-radius: 16px                         |

**Background effects:**

| Tailwind            | CSS                                                     |
| ------------------- | ------------------------------------------------------- |
| `bg-gradient-to-r`  | background-image: linear-gradient(to right, ...)        |
| `bg-gradient-to-br` | background-image: linear-gradient(to bottom right, ...) |
| `from-*` / `to-*`   | use gradient stops                                      |
| `backdrop-blur-sm`  | backdrop-filter: blur(4px)                              |
| `backdrop-blur-md`  | backdrop-filter: blur(8px)                              |

**Interactivity:**

| Tailwind                     | CSS                                                        |
| ---------------------------- | ---------------------------------------------------------- |
| `cursor-pointer`             | cursor: pointer                                            |
| `cursor-not-allowed`         | cursor: not-allowed                                        |
| `select-none`                | user-select: none                                          |
| `pointer-events-none`        | pointer-events: none                                       |
| `resize-none`                | resize: none                                               |
| `resize-vertical`            | resize: vertical                                           |
| `overflow-auto`              | overflow: auto                                             |
| `overflow-hidden`            | overflow: hidden                                           |
| `overflow-y-auto`            | overflow-y: auto                                           |
| `overflow-x-hidden`          | overflow-x: hidden                                         |
| `overscroll-contain`         | overscroll-behavior: contain                               |
| `scroll-smooth`              | scroll-behavior: smooth                                    |
| `appearance-none`            | appearance: none                                           |
| `outline-none`               | outline: none                                              |
| `ring-0`                     | box-shadow: none                                           |
| `focus-visible:outline-none` | &:focus-visible { outline: none }                          |
| `focus-visible:ring-2`       | &:focus-visible { box-shadow: 0 0 0 2px hsl(var(--ring)) } |

**Transforms & Animation:**

| Tailwind               | CSS                                                                 |
| ---------------------- | ------------------------------------------------------------------- |
| `transition-colors`    | transition: color 150ms, background-color 150ms, border-color 150ms |
| `transition-all`       | transition: all 150ms                                               |
| `transition-opacity`   | transition: opacity 150ms                                           |
| `transition-transform` | transition: transform 150ms                                         |
| `duration-200`         | transition-duration: 200ms                                          |
| `ease-in-out`          | transition-timing-function: ease-in-out                             |
| `scale-90`             | transform: scale(0.9)                                               |
| `scale-100`            | transform: scale(1)                                                 |
| `opacity-0`            | opacity: 0                                                          |
| `opacity-50`           | opacity: 0.5                                                        |
| `opacity-100`          | opacity: 1                                                          |
| `animate-spin`         | animation: spin 1s linear infinite                                  |
| `animate-pulse`        | animation: pulse 2s ease-in-out infinite                            |
| `animate-shimmer`      | animation: shimmer 2s infinite                                      |
| `shrink-0`             | flex-shrink: 0                                                      |
| `grow`                 | flex-grow: 1                                                        |

**Misc:**

| Tailwind                | CSS                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `relative`              | position: relative                                                                                      |
| `absolute`              | position: absolute                                                                                      |
| `fixed`                 | position: fixed                                                                                         |
| `sticky`                | position: sticky                                                                                        |
| `top-0`                 | top: 0                                                                                                  |
| `left-0`                | left: 0                                                                                                 |
| `right-0`               | right: 0                                                                                                |
| `bottom-0`              | bottom: 0                                                                                               |
| `inset-0`               | inset: 0                                                                                                |
| `z-10`                  | z-index: 10                                                                                             |
| `z-50`                  | z-index: 50                                                                                             |
| `z-[100]`               | z-index: 100                                                                                            |
| `sr-only`               | position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap |
| `hidden`                | display: none                                                                                           |
| `invisible`             | visibility: hidden                                                                                      |
| `visible`               | visibility: visible                                                                                     |
| `shadow-sm`             | box-shadow: 0 1px 2px rgba(0,0,0,0.05)                                                                  |
| `shadow-md`             | box-shadow: 0 4px 6px rgba(0,0,0,0.1)                                                                   |
| `shadow-lg`             | box-shadow: 0 10px 15px rgba(0,0,0,0.1)                                                                 |
| `shadow-xl`             | box-shadow: 0 20px 25px rgba(0,0,0,0.1)                                                                 |
| `divide-y`              | > * + * { border-top: 1px solid hsl(var(--border)) }                                                    |
| `divide-x`              | > * + * { border-left: 1px solid hsl(var(--border)) }                                                   |
| `data-[state=open]:*`   | &[data-state="open"] { ... }                                                                            |
| `data-[state=closed]:*` | &[data-state="closed"] { ... }                                                                          |
| `data-[side=*]:*`       | &[data-side="..."] { ... }                                                                              |
| `group-hover:*`         | .group:hover & { ... }                                                                                  |

### Step 3: Determine if the component is composite or atomic

**If `index.ts` exports multiple sub-components** (e.g., `Root`, `Header`, `Body`, `Toolbar`):

The component is **composite**. Generate one standalone `.svelte` file that combines all sub-components into a single file. Use a naming convention based on the aliases in `index.ts` (e.g., `PromptInput`).

Each sub-component becomes an internal structural element styled via Sass. Props at the top level accept snippet children for customizable sections.

**If `index.ts` exports a single component** (e.g., `Button`, `Badge`):

The component is **atomic**. Generate a focused `.svelte` file with variants as props.

### Step 4: Generate the standalone .svelte file structure

```svelte
<script lang="ts">
	// 1. Type imports (only vanilla TS types — no framework imports beyond Svelte runes)
	// 2. Interface for Props
	// 3. $props() / $bindable() destructuring
	// 4. $state / $derived / $effect reactive declarations
	// 5. Helper functions (event handlers, etc.)
</script>

<!-- HTML template -->
<div class="component-root">
	{@render children()}
</div>

<style lang="sass">
	// WRONG — Sass indented syntax errors on `--` at root level:
	// --bg: 0 0% 100%
	// Instead, scope custom properties inside a selector block:

	// Component root with HSL tokens
	.component-root
		--bg: 0 0% 100%
		--fg: 222 47% 11%
		display: flex
		flex-direction: column

	// Nested elements use tab-indented nesting
	.header
		padding: 8px
		border-bottom: 1px solid hsl(var(--border))

	// Pseudo-classes
	.header:hover
		background-color: hsl(var(--bg-muted))

	// Data attribute selectors
	.item[data-state="open"]
		display: block

	// Keyframes at root level (no indent)
	@keyframes spin
		from
			transform: rotate(0deg)
		to
			transform: rotate(360deg)

	// Dark mode — custom properties scoped inside .component-root
	@media (prefers-color-scheme: dark)
		.component-root
			--bg: 222 47% 11%
			--fg: 210 40% 98%

	// Reduced motion
	@media (prefers-reduced-motion: reduce)
		.spinner
			animation: none
			transition: none
</style>
```

### Step 5: Pure indented Sass rules

**CRITICAL — These rules are non-negotiable:**

1. **Syntax**: Pure indented Sass (`.sass`), **NOT SCSS** (`.scss`)
2. **No curly braces `{}`** anywhere in the style block — use indentation only
3. **No semicolons `;`** — omit all semicolons
4. **No colons `:` after property names** — proper indented Sass uses `property: value` with the colon, but **NO** semicolons. Wait — actually in Sass indented syntax, colons ARE used after property names, but no semicolons. Let me clarify:
   - Use `property: value` (with colon and space)
   - **No semicolons** after values
   - **No curly braces** for blocks
5. **Single-tab indentation** (1 tab per nesting level) — never spaces
6. **Nesting**: Child selectors are indented one tab under parent
7. **`&` prefix** for pseudo-classes and parent references: `&:hover`, `&[data-state="open"]`
8. **`@media`** queries are nested at the same level as the root, with inner rules indented
9. **`@keyframes`** use indented blocks, no braces

Correct example:

```sass
.component-root
	--bg: 0 0% 100%
	--fg: 222 47% 11%
	--radius: 8px
	display: flex
	align-items: center
	padding: 8px 16px
	border-radius: var(--radius)
	background-color: hsl(var(--bg))
	color: hsl(var(--fg))
	cursor: pointer

.button
	display: flex
	padding: 4px 8px

	&:hover
		background-color: hsl(var(--bg-muted))

	&[data-disabled="true"]
		opacity: 0.5
		cursor: not-allowed

@keyframes spin
	0%
		transform: rotate(0deg)
	100%
		transform: rotate(360deg)

@media (prefers-color-scheme: dark)
	.component-root
		--bg: 222 47% 11%
		--fg: 210 40% 98%
```

Incorrect (SCSS with braces/semicolons):

```scss
.button {
	display: flex;
	align-items: center;

	&:hover {
		background-color: hsl(var(--bg-muted));
	}
}
```

### Step 6: Output format

Write the output to the user-specified output path (or ask if not provided).

The output file should be named after the component (PascalCase, e.g., `PromptInput.svelte`) and placed at the path the user specifies.

## Common pitfalls to avoid

### 1. CSS custom properties (`--var`) must be inside a Sass selector

**WRONG** — Sass indented syntax cannot parse `--` at the root of `<style lang="sass">`:

```sass
--bg: 0 0% 100%
--fg: 222 47% 11%

.component-root
	background: hsl(var(--bg))
```

**CORRECT** — Scope custom properties inside a selector block:

```sass
.component-root
	--bg: 0 0% 100%
	--fg: 222 47% 11%
	background: hsl(var(--bg))
```

The same applies inside `@media` — always nest `--` overrides inside a selector:

```sass
@media (prefers-color-scheme: dark)
	.component-root
		--bg: 222 47% 11%
		--fg: 210 40% 98%
```

### 2. Never nest `<button>` inside another `<button>`

The browser "repairs" nested buttons by moving/removing elements, which breaks Svelte's DOM assumptions (`node_invalid_placement` error).

**WRONG:**

```svelte
<button class="card" onclick={...}>
	<img src={url} alt="preview" />
	<button onclick={(e) => { e.stopPropagation(); onRemove(); }}>X</button>
</button>
```

**CORRECT** — Use `<span>` with `role="button"`, `tabindex="0"`, and keyboard handlers:

```svelte
<button class="card" onclick={...}>
	<img src={url} alt="preview" />
	<span
		role="button"
		tabindex="0"
		aria-label="Remove"
		onclick={(e) => { e.stopPropagation(); onRemove(); }}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onRemove(); } }}
	>X</span>
</button>
```

### 3. Use `untrack()` when passing `$bindable`/`$props` values to class constructors

Plain classes instantiated in the template scope are not reactive containers. Passing a `$bindable()` or `$props()` value to a constructor triggers the `state_referenced_locally` warning because Svelte thinks you meant to reference it reactively.

**WRONG:**

```ts
let { accept }: Props = $props();
let ctrl = new Controller({ accept }); // warning: captures only initial value
```

**CORRECT** — Wrap with `untrack(() => ...)` to signal one-time capture:

```ts
import { untrack } from 'svelte';

let { accept, multiple }: Props = $props();
let ctrl = new Controller({
	accept: untrack(() => accept),
	multiple: untrack(() => multiple)
});

// Use $effect blocks to sync prop changes back if needed
$effect(() => {
	ctrl.configure({ accept, multiple });
});
```

## Example end-to-end

**User query**: "Extract the prompt-input component from `/Users/amrit/Documents/GitHub/ai-elements-master/src/lib/components/ai-elements/prompt-input` and output to `./extracted/PromptInput.svelte`"

**Your process**:

1. Read `guide.md` → learn: Header wraps Body wraps Toolbar
2. Read `index.ts` → learn: 18 sub-components, aliases like `PromptInput`, `PromptInputHeader`, etc.
3. Read `core/root.svelte` → learn: Props interface with onSubmit, attachments, accept, etc.; uses context from provider; renders children snippet
4. Read `core/provider.svelte` → learn: Controller class, setPromptInputProvider, initialInput / accept / multiple props
5. Read `layout/header.svelte`, `layout/body.svelte`, `layout/toolbar.svelte` → learn: flex layouts, padding, border
6. Read `controls/textarea.svelte` → learn: value binding, placeholder, keydown handling
7. Read `controls/submit.svelte` → learn: status-based icon switching, disabled states
8. Read `controls/button.svelte` → learn: variant/size styling
9. Extract all Tailwind classes from every file, convert each via the table in Step 2
10. Generate a single `PromptInput.svelte` with all sub-components inlined, all styling in `<style lang="sass">`, all logic using Svelte 5 runes

## Important constraints

- **No external dependencies**: Do NOT import from `$lib`, `bits-ui`, `shadcn-svelte`, `lucide-svelte`, or any project-specific modules. Inline SVG icons instead. Convert `class={cn(...)}` to static class names or Sass nesting.
- **All state uses runes**: `$state()`, `$derived()`, `$effect()`, `$props()`, `$bindable()`. No `let` variables for reactive state. No `export let`. No `onMount` / `onDestroy` unless absolutely necessary.
- **No stores**: Convert `writable`/`readable`/`derived` stores to rune-based state.
- **No `createEventDispatcher`**: Use callback props instead (e.g., `onclick`, `onsubmit`).
- **Snippets over slots**: Use `{@render children()}` instead of `<slot />`. Use named snippet props for multiple content areas.
- **Inlined SVG icons**: Replace any icon imports with inline SVG elements. Use simple geometric shapes. Keep icons minimal.
- **Form handling**: Use native HTML form elements with `onsubmit` callback prop. Use `form.requestSubmit()` for programmatic submission.
- **Accessibility**: Preserve `aria-*` attributes, `role` attributes, keyboard handling (Enter, Escape, arrow keys).
