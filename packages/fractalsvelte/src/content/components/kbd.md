<script lang="ts">
	import { Button } from "$lib/components/button/index.js";
	import { Kbd, KbdGroup } from "$lib/components/kbd/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const props: PropRow[] = [
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the rendered <kbd> element.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "The key label. Single glyphs (⌘, ⇧, ↵) and words (Esc, Tab) both work.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Kbd, KbdGroup } from "fractalsvelte/kbd";
<\/script>

<Kbd>⌘</Kbd>`;

	const codeSingle = `<Kbd>⌘</Kbd>
<Kbd>Shift</Kbd>
<Kbd>Esc</Kbd>`;

	const codeGroup = `<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>`;

	const codeButton = `<Button variant="outline" size="sm">
  Search
  <KbdGroup>
    <Kbd>⌘</Kbd>
    <Kbd>K</Kbd>
  </KbdGroup>
</Button>`;

	const codeInline = `<p>
  Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette.
</p>`;
</script>

<h1 class="doc-title">Kbd</h1>
<p class="doc-lede">Displays a keyboard key or a shortcut.</p>

<Preview description="Kbd — a shortcut" code={codeGroup}>
	<KbdGroup>
		<Kbd>⌘</Kbd>
		<Kbd>K</Kbd>
	</KbdGroup>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/kbd/` into your project — it has no runtime dependencies.

## Usage

<CodeBlock code={usage} />

Use `KbdGroup` to bind several keys into one shortcut. Both render a `<kbd>` element, so the
markup stays semantic.

## Examples

{#snippet demoSingle()}
	<Kbd>⌘</Kbd>
	<Kbd>⇧</Kbd>
	<Kbd>↵</Kbd>
	<Kbd>Esc</Kbd>
	<Kbd>Tab</Kbd>
{/snippet}

{#snippet demoGroup()}
	<KbdGroup>
		<Kbd>⌘</Kbd>
		<Kbd>K</Kbd>
	</KbdGroup>
	<KbdGroup>
		<Kbd>⌘</Kbd>
		<Kbd>⇧</Kbd>
		<Kbd>P</Kbd>
	</KbdGroup>
	<KbdGroup>
		<Kbd>Ctrl</Kbd>
		<Kbd>Alt</Kbd>
		<Kbd>Del</Kbd>
	</KbdGroup>
{/snippet}

{#snippet demoButton()}
	<Button variant="outline" size="sm">
		Search
		<KbdGroup>
			<Kbd>⌘</Kbd>
			<Kbd>K</Kbd>
		</KbdGroup>
	</Button>
	<Button variant="ghost" size="sm">
		Save
		<Kbd>⌘S</Kbd>
	</Button>
{/snippet}

{#snippet demoInline()}
	<span>
		Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette.
	</span>
{/snippet}

<Examples
	items={[
		{ title: "Single keys", demo: demoSingle, code: codeSingle },
		{
			title: "Shortcuts",
			demo: demoGroup,
			code: codeGroup,
			description: "KbdGroup tightens the gap between keys that belong to one chord.",
		},
		{ title: "In a button", demo: demoButton, code: codeButton },
		{
			title: "Inline in text",
			demo: demoInline,
			code: codeInline,
			description: "Sits on the text baseline and inherits the surrounding line height.",
		},
	]}
/>

## Props

Both `Kbd` and `KbdGroup` take the same props.

<PropsTable {props} />

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--muted` | key background |
| `--muted-foreground` | key label |
| `--radius` | corner radius |
| `--text-xs` | label size |
| `--input` | background inside an input group |
| `--background` | background and label inside a tooltip |

</div>

Kbd restyles itself contextually: inside an input group it takes the input background, and
inside a tooltip it inverts. No prop is needed — it reads its ancestor.
