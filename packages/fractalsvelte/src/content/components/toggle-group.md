<script lang="ts">
	import * as ToggleGroup from "$lib/components/toggle-group/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let multipleValue = $state(["bold"]);
	let singleValue = $state("italic");
	let spacedValue = $state(["star"]);

	const props: PropRow[] = [
		{
			name: "Root type",
			type: '"single" | "multiple"',
			description: "Selection mode. Required.",
		},
		{
			name: "Root value",
			type: "string | string[]",
			description:
				"Bindable selected value (single) or values (multiple).",
		},
		{
			name: "variant",
			type: '"default" | "outline"',
			default: '"default"',
			description: "Visual style inherited by items. Rendered as data-variant.",
		},
		{
			name: "size",
			type: '"default" | "sm" | "lg"',
			default: '"default"',
			description: "Item height, minimum width and padding inherited by items.",
		},
		{
			name: "spacing",
			type: "number",
			default: "0",
			description:
				"Gap between items in quarter-rem steps. Zero joins outline borders into one control.",
		},
		{
			name: "orientation",
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description: "Keyboard navigation and visual stacking direction.",
		},
		{
			name: "pressedSurface",
			type: '"muted" | "transparent"',
			default: '"muted"',
			description: "Default pressed surface inherited by items.",
		},
		{
			name: "pressedIconTone",
			type: '"default" | "primary" | "accent" | "destructive"',
			default: '"default"',
			description: "Default pressed icon colour inherited by items.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Disables the whole group or an individual item.",
		},
		{
			name: "loop",
			type: "boolean",
			default: "true",
			description: "Whether keyboard navigation wraps at the ends.",
		},
		{
			name: "rovingFocus",
			type: "boolean",
			default: "true",
			description: "Whether arrow keys move focus within the group.",
		},
		{
			name: "Item value",
			type: "string",
			description: "Item value. Required on ToggleGroup.Item.",
		},
		{
			name: "Item variant",
			type: '"default" | "outline"',
			description: "Overrides the root variant for one item.",
		},
		{
			name: "Item size",
			type: '"default" | "sm" | "lg"',
			description: "Overrides the root size for one item.",
		},
		{
			name: "Item pressedSurface",
			type: '"muted" | "transparent"',
			description: "Overrides the root pressed surface for one item.",
		},
		{
			name: "Item pressedIconTone",
			type: '"default" | "primary" | "accent" | "destructive"',
			description: "Overrides the root pressed icon tone for one item.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Group or item contents. Icons are sized automatically.",
		},
		{
			name: "child",
			type: "Snippet",
			description:
				"Renders a custom element with group or item behaviour and attributes applied.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | HTMLButtonElement | null",
			default: "null",
			description: "Bindable reference to the root group or item button.",
		},
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as ToggleGroup from "fractalsvelte/toggle-group";
<\/script>

<ToggleGroup.Root type="multiple" variant="outline">
  <ToggleGroup.Item value="bold" aria-label="Toggle bold">
    <BoldIcon />
  </ToggleGroup.Item>
  <ToggleGroup.Item value="italic" aria-label="Toggle italic">
    <ItalicIcon />
  </ToggleGroup.Item>
  <ToggleGroup.Item value="underline" aria-label="Toggle underline">
    <UnderlineIcon />
  </ToggleGroup.Item>
</ToggleGroup.Root>`;

	const codeOutline = `<ToggleGroup.Root type="multiple" variant="outline">
  <ToggleGroup.Item value="bold" aria-label="Toggle bold"><BoldIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="italic" aria-label="Toggle italic"><ItalicIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="underline" aria-label="Toggle underline"><UnderlineIcon /></ToggleGroup.Item>
</ToggleGroup.Root>`;

	const codeSingle = `<ToggleGroup.Root type="single">
  <ToggleGroup.Item value="bold" aria-label="Toggle bold"><BoldIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="italic" aria-label="Toggle italic"><ItalicIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="underline" aria-label="Toggle underline"><UnderlineIcon /></ToggleGroup.Item>
</ToggleGroup.Root>`;

	const codeSm = `<ToggleGroup.Root type="single" size="sm">
  <ToggleGroup.Item value="bold" aria-label="Toggle bold"><BoldIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="italic" aria-label="Toggle italic"><ItalicIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="underline" aria-label="Toggle underline"><UnderlineIcon /></ToggleGroup.Item>
</ToggleGroup.Root>`;

	const codeLg = `<ToggleGroup.Root type="multiple" size="lg">
  <ToggleGroup.Item value="bold" aria-label="Toggle bold"><BoldIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="italic" aria-label="Toggle italic"><ItalicIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="underline" aria-label="Toggle underline"><UnderlineIcon /></ToggleGroup.Item>
</ToggleGroup.Root>`;

	const codeSpacing = `<ToggleGroup.Root type="multiple" variant="outline" spacing={2} size="sm">
  <ToggleGroup.Item
    value="star"
    pressedSurface="transparent"
    pressedIconTone="primary"
    aria-label="Toggle star"
  >
    <StarIcon />
    Star
  </ToggleGroup.Item>
  <ToggleGroup.Item
    value="heart"
    pressedSurface="transparent"
    pressedIconTone="destructive"
    aria-label="Toggle heart"
  >
    <HeartIcon />
    Heart
  </ToggleGroup.Item>
  <ToggleGroup.Item
    value="bookmark"
    pressedSurface="transparent"
    pressedIconTone="accent"
    aria-label="Toggle bookmark"
  >
    <BookmarkIcon />
    Bookmark
  </ToggleGroup.Item>
</ToggleGroup.Root>`;

	const codeVertical = `<ToggleGroup.Root type="multiple" orientation="vertical" variant="outline">
  <ToggleGroup.Item value="bold" aria-label="Toggle bold"><BoldIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="italic" aria-label="Toggle italic"><ItalicIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="underline" aria-label="Toggle underline"><UnderlineIcon /></ToggleGroup.Item>
</ToggleGroup.Root>`;

	const codeDisabled = `<ToggleGroup.Root type="single" disabled>
  <ToggleGroup.Item value="bold" aria-label="Toggle bold"><BoldIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="italic" aria-label="Toggle italic"><ItalicIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="underline" aria-label="Toggle underline"><UnderlineIcon /></ToggleGroup.Item>
</ToggleGroup.Root>`;
</script>

{#snippet boldIcon()}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		<path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />
	</svg>
{/snippet}

{#snippet italicIcon()}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		<path d="M19 4l-9 16M14 4h7M3 20h7" />
	</svg>
{/snippet}

{#snippet underlineIcon()}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		<path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" />
	</svg>
{/snippet}

<h1 class="doc-title">Toggle Group</h1>
<p class="doc-lede">A set of two-state buttons that work as a single selection control.</p>

<Preview description="Toggle Group — formatting controls" code={codeOutline}>
	<ToggleGroup.Root bind:value={multipleValue} type="multiple" variant="outline">
		<ToggleGroup.Item value="bold" aria-label="Toggle bold">{@render boldIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="italic" aria-label="Toggle italic">{@render italicIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="underline" aria-label="Toggle underline">{@render underlineIcon()}</ToggleGroup.Item>
	</ToggleGroup.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/toggle-group/` into your project. It depends on `bits-ui` and
reuses types from `toggle/`. Copy `styles/_mixins.sass` and `_tokens.sass` too if you do
not already have them.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoOutline()}
	<ToggleGroup.Root bind:value={multipleValue} type="multiple" variant="outline">
		<ToggleGroup.Item value="bold" aria-label="Toggle bold">{@render boldIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="italic" aria-label="Toggle italic">{@render italicIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="underline" aria-label="Toggle underline">{@render underlineIcon()}</ToggleGroup.Item>
	</ToggleGroup.Root>
{/snippet}

{#snippet demoSingle()}
	<ToggleGroup.Root bind:value={singleValue} type="single">
		<ToggleGroup.Item value="bold" aria-label="Toggle bold">{@render boldIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="italic" aria-label="Toggle italic">{@render italicIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="underline" aria-label="Toggle underline">{@render underlineIcon()}</ToggleGroup.Item>
	</ToggleGroup.Root>
{/snippet}

{#snippet demoSm()}
	<ToggleGroup.Root type="single" size="sm">
		<ToggleGroup.Item value="bold" aria-label="Toggle bold">{@render boldIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="italic" aria-label="Toggle italic">{@render italicIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="underline" aria-label="Toggle underline">{@render underlineIcon()}</ToggleGroup.Item>
	</ToggleGroup.Root>
{/snippet}

{#snippet demoLg()}
	<ToggleGroup.Root type="multiple" size="lg">
		<ToggleGroup.Item value="bold" aria-label="Toggle bold">{@render boldIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="italic" aria-label="Toggle italic">{@render italicIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="underline" aria-label="Toggle underline">{@render underlineIcon()}</ToggleGroup.Item>
	</ToggleGroup.Root>
{/snippet}

{#snippet demoSpacing()}
	<ToggleGroup.Root
		bind:value={spacedValue}
		type="multiple"
		variant="outline"
		spacing={2}
		size="sm"
	>
		<ToggleGroup.Item
			value="star"
			pressedSurface="transparent"
			pressedIconTone="primary"
			aria-label="Toggle star"
		>
			<svg
				data-icon="inline-start"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					d="M12 2l2.9 6.1 6.7.9-4.8 4.7 1.1 6.6-5.9-3.1-5.9 3.1 1.1-6.6L2.4 9l6.7-.9z"
				/>
			</svg>
			Star
		</ToggleGroup.Item>
		<ToggleGroup.Item
			value="heart"
			pressedSurface="transparent"
			pressedIconTone="destructive"
			aria-label="Toggle heart"
		>
			<svg
				data-icon="inline-start"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"
				/>
			</svg>
			Heart
		</ToggleGroup.Item>
		<ToggleGroup.Item
			value="bookmark"
			pressedSurface="transparent"
			pressedIconTone="accent"
			aria-label="Toggle bookmark"
		>
			<svg
				data-icon="inline-start"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
			</svg>
			Bookmark
		</ToggleGroup.Item>
	</ToggleGroup.Root>
{/snippet}

{#snippet demoVertical()}
	<ToggleGroup.Root type="multiple" orientation="vertical" variant="outline">
		<ToggleGroup.Item value="bold" aria-label="Toggle bold">{@render boldIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="italic" aria-label="Toggle italic">{@render italicIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="underline" aria-label="Toggle underline">{@render underlineIcon()}</ToggleGroup.Item>
	</ToggleGroup.Root>
{/snippet}

{#snippet demoDisabled()}
	<ToggleGroup.Root type="single" disabled>
		<ToggleGroup.Item value="bold" aria-label="Toggle bold">{@render boldIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="italic" aria-label="Toggle italic">{@render italicIcon()}</ToggleGroup.Item>
		<ToggleGroup.Item value="underline" aria-label="Toggle underline">{@render underlineIcon()}</ToggleGroup.Item>
	</ToggleGroup.Root>
{/snippet}

<Examples
	items={[
		{ title: "Outline", demo: demoOutline, code: codeOutline },
		{ title: "Single", demo: demoSingle, code: codeSingle },
		{ title: "Small", demo: demoSm, code: codeSm },
		{ title: "Large", demo: demoLg, code: codeLg },
		{
			title: "Spacing",
			demo: demoSpacing,
			code: codeSpacing,
			description:
				"spacing={2} gaps items by 0.5rem. Pair with pressedSurface and pressedIconTone for icon-colour toggles.",
		},
		{ title: "Vertical", demo: demoVertical, code: codeVertical },
		{ title: "Disabled", demo: demoDisabled, code: codeDisabled },
	]}
/>

## Props

<PropsTable {props} />

## Theming

Toggle Group reads these tokens. Override them on `:root`, or on any ancestor to scope a theme.

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--muted` | Hover and default pressed item surface |
| `--foreground` | Hover text colour |
| `--primary` | Primary pressed icon tone |
| `--accent-foreground` | Accent pressed icon tone |
| `--destructive` | Destructive pressed icon tone and invalid ring |
| `--input` | Outline item border |
| `--ring` | Focus-visible ring |
| `--text-sm` / `--text-sm--line-height` | Item label size |
| `--default-transition-*` | Item colour and border transition timing |
| `--toggle-group-gap` | Component-scoped gap (set from the `spacing` prop) |

</div>

With `spacing={0}` and `variant="outline"`, adjacent items share borders and the group
keeps a single outer radius. Raise `spacing` to separate items into individual pills.
