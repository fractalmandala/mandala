<script lang="ts">
	import { Toggle } from "$lib/components/toggle/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const props: PropRow[] = [
		{
			name: "variant",
			type: '"default" | "outline"',
			default: '"default"',
			description: "Visual style. Rendered as data-variant.",
		},
		{
			name: "size",
			type: '"default" | "sm" | "lg"',
			default: '"default"',
			description: "Height, minimum width and padding. Rendered as data-size.",
		},
		{
			name: "pressed",
			type: "boolean",
			default: "false",
			description: "Bindable pressed state.",
		},
		{
			name: "onPressedChange",
			type: "(pressed: boolean) => void",
			description: "Called when the pressed state changes.",
		},
		{
			name: "pressedSurface",
			type: '"muted" | "transparent"',
			default: '"muted"',
			description:
				'Surface while pressed. Use "transparent" for icon-colour-only toggles.',
		},
		{
			name: "pressedIconTone",
			type: '"default" | "primary" | "accent" | "destructive"',
			default: '"default"',
			description:
				"Token-backed icon colour while pressed. Icons must use currentColor.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the control and blocks pointer interaction.",
		},
		{
			name: "aria-invalid",
			type: "boolean",
			description: "Switches the border and ring to the destructive colour.",
		},
		{
			name: "ref",
			type: "HTMLButtonElement | null",
			default: "null",
			description: "Bindable reference to the rendered button.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Toggle content. Icons are sized automatically.",
		},
		{
			name: "child",
			type: "Snippet",
			description: "Renders a custom child with toggle behaviour and attributes applied.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Toggle } from "fractalsvelte/toggle";
<\/script>

<Toggle aria-label="Toggle italic">
  <ItalicIcon />
</Toggle>`;

	const codeDefault = `<Toggle
  aria-label="Toggle bookmark"
  variant="outline"
  size="sm"
  pressedSurface="transparent"
  pressedIconTone="primary"
>
  <BookmarkIcon />
  Bookmark
</Toggle>`;

	const codeOutline = `<Toggle variant="outline" aria-label="Toggle italic">
  <ItalicIcon />
</Toggle>`;

	const codeWithText = `<Toggle aria-label="Toggle italic">
  <ItalicIcon data-icon="inline-start" />
  Italic
</Toggle>`;

	const codeSizes = `<Toggle size="sm" aria-label="Small italic"><ItalicIcon /></Toggle>
<Toggle aria-label="Default italic"><ItalicIcon /></Toggle>
<Toggle size="lg" aria-label="Large italic"><ItalicIcon /></Toggle>`;

	const codePressedTone = `<Toggle
  aria-label="Toggle bookmark"
  variant="outline"
  size="sm"
  pressedSurface="transparent"
  pressedIconTone="primary"
>
  <BookmarkIcon />
  Bookmark
</Toggle>`;

	const codeDisabled = `<Toggle aria-label="Toggle underline" disabled>
  <UnderlineIcon />
</Toggle>`;
</script>

<h1 class="doc-title">Toggle</h1>
<p class="doc-lede">A two-state button that can be pressed or unpressed.</p>

<Preview description="Toggle — outline with text" code={codeDefault}>
	<Toggle
		aria-label="Toggle bookmark"
		variant="outline"
		size="sm"
		pressedSurface="transparent"
		pressedIconTone="primary"
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
	</Toggle>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/toggle/` into your project. It
expects `styles/_mixins.sass` and `_tokens.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoOutline()}
	<Toggle variant="outline" aria-label="Toggle italic">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M19 4l-9 16M14 4h7M3 20h7" />
		</svg>
	</Toggle>
{/snippet}

{#snippet demoWithText()}
	<Toggle aria-label="Toggle italic">
		<svg
			data-icon="inline-start"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M19 4l-9 16M14 4h7M3 20h7" />
		</svg>
		Italic
	</Toggle>
{/snippet}

{#snippet demoSizes()}
	<div class="row" style="align-items:center; gap:0.75rem">
		<Toggle size="sm" aria-label="Small italic">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 4l-9 16M14 4h7M3 20h7" />
			</svg>
		</Toggle>
		<Toggle aria-label="Default italic">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 4l-9 16M14 4h7M3 20h7" />
			</svg>
		</Toggle>
		<Toggle size="lg" aria-label="Large italic">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 4l-9 16M14 4h7M3 20h7" />
			</svg>
		</Toggle>
	</div>
{/snippet}

{#snippet demoPressedTone()}
	<div class="row" style="align-items:center; gap:0.75rem; flex-wrap:wrap">
		<Toggle
			aria-label="Toggle bookmark"
			variant="outline"
			size="sm"
			pressedSurface="transparent"
			pressedIconTone="primary"
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
		</Toggle>
		<Toggle
			aria-label="Toggle star"
			variant="outline"
			size="sm"
			pressedSurface="transparent"
			pressedIconTone="accent"
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
		</Toggle>
		<Toggle
			aria-label="Toggle heart"
			variant="outline"
			size="sm"
			pressedSurface="transparent"
			pressedIconTone="destructive"
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
		</Toggle>
	</div>
{/snippet}

{#snippet demoDisabled()}
	<Toggle aria-label="Toggle underline" disabled>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" />
		</svg>
	</Toggle>
{/snippet}

<Examples
	items={[
		{ title: "Outline", demo: demoOutline, code: codeOutline },
		{ title: "With text", demo: demoWithText, code: codeWithText },
		{ title: "Sizes", demo: demoSizes, code: codeSizes },
		{
			title: "Pressed tone",
			demo: demoPressedTone,
			code: codePressedTone,
			description:
				"pressedSurface and pressedIconTone replace one-off colour classes. Icons need currentColor.",
		},
		{ title: "Disabled", demo: demoDisabled, code: codeDisabled },
	]}
/>

## Props

<PropsTable {props} />

## Theming

Toggle reads these tokens. Override them on `:root`, or on any ancestor to scope a theme.

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--muted` | Hover and default pressed surface |
| `--foreground` | Hover text colour |
| `--input` | Outline border |
| `--ring` | Focus-visible ring |
| `--destructive` | Invalid ring and destructive pressed icon tone |
| `--primary` | Primary pressed icon tone |
| `--accent-foreground` | Accent pressed icon tone |
| `--text-sm` / `--text-sm--line-height` | Label size |
| `--default-transition-*` | Colour and border transition timing |

</div>

The `aria-invalid="true"` attribute switches the border and focus ring to `--destructive`,
so form libraries get error styling without a prop. Icons are sized to `1rem` unless they
set their own dimensions. Use `data-icon="inline-start"` or `data-icon="inline-end"` on an
icon to tighten padding on that side.
