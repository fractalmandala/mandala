<script lang="ts">
	import * as NativeSelect from "$lib/components/native-select/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let fruit = $state("apple");

	const props: PropRow[] = [
		{
			name: "value",
			type: "string",
			description: "Bindable. Use bind:value for two-way binding.",
		},
		{
			name: "size",
			type: '"default" | "sm"',
			default: '"default"',
			description: "Control height — 2.25rem or 2rem.",
		},
		{
			name: "icon",
			type: "Snippet",
			description: "Replaces the built-in chevron.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the whole control, chevron included.",
		},
		{
			name: "aria-invalid",
			type: "boolean",
			description: "Switches the border and focus ring to the destructive colour.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the underlying select.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as NativeSelect from "fractalsvelte/native-select";

  let fruit = $state("apple");
<\/script>

<NativeSelect.Root bind:value={fruit}>
  <NativeSelect.Option value="apple">Apple</NativeSelect.Option>
  <NativeSelect.Option value="banana">Banana</NativeSelect.Option>
</NativeSelect.Root>`;

	const codeGroups = `<NativeSelect.Root>
  <NativeSelect.OptGroup label="Fruit">
    <NativeSelect.Option value="apple">Apple</NativeSelect.Option>
  </NativeSelect.OptGroup>
  <NativeSelect.OptGroup label="Vegetables">
    <NativeSelect.Option value="carrot">Carrot</NativeSelect.Option>
  </NativeSelect.OptGroup>
</NativeSelect.Root>`;

	const codeSizes = `<NativeSelect.Root size="sm">…</NativeSelect.Root>
<NativeSelect.Root>…</NativeSelect.Root>`;

	const codeStates = `<NativeSelect.Root disabled>…</NativeSelect.Root>
<NativeSelect.Root aria-invalid="true">…</NativeSelect.Root>`;
</script>

<h1 class="doc-title">Native Select</h1>
<p class="doc-lede">A styled wrapper around the browser's own select control.</p>

<Preview description="Native Select — default" code={usage}>
	<NativeSelect.Root bind:value={fruit}>
		<NativeSelect.Option value="apple">Apple</NativeSelect.Option>
		<NativeSelect.Option value="banana">Banana</NativeSelect.Option>
		<NativeSelect.Option value="cherry">Cherry</NativeSelect.Option>
	</NativeSelect.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/native-select/` into your project — it has no runtime
dependencies and the chevron is inline.

## Usage

<CodeBlock code={usage} />

This is the real `<select>` element, so it gets the platform's own dropdown — the wheel picker
on iOS, the native list on Android and desktop. Prefer it over a custom select when the
options are simple; reach for a custom one only when you need search, multi-select, or rich
option content.

## Examples

{#snippet demoBasic()}
	<div class="box" style="gap:0.5rem">
		<NativeSelect.Root bind:value={fruit}>
			<NativeSelect.Option value="apple">Apple</NativeSelect.Option>
			<NativeSelect.Option value="banana">Banana</NativeSelect.Option>
			<NativeSelect.Option value="cherry">Cherry</NativeSelect.Option>
		</NativeSelect.Root>
		<span style="font-size:0.75rem; color:var(--muted-foreground)">Selected: {fruit}</span>
	</div>
{/snippet}

{#snippet demoGroups()}
	<NativeSelect.Root>
		<NativeSelect.OptGroup label="Fruit">
			<NativeSelect.Option value="apple">Apple</NativeSelect.Option>
			<NativeSelect.Option value="banana">Banana</NativeSelect.Option>
		</NativeSelect.OptGroup>
		<NativeSelect.OptGroup label="Vegetables">
			<NativeSelect.Option value="carrot">Carrot</NativeSelect.Option>
			<NativeSelect.Option value="pea">Pea</NativeSelect.Option>
		</NativeSelect.OptGroup>
	</NativeSelect.Root>
{/snippet}

{#snippet demoSizes()}
	<NativeSelect.Root size="sm">
		<NativeSelect.Option>Small</NativeSelect.Option>
	</NativeSelect.Root>
	<NativeSelect.Root>
		<NativeSelect.Option>Default</NativeSelect.Option>
	</NativeSelect.Root>
{/snippet}

{#snippet demoStates()}
	<NativeSelect.Root disabled>
		<NativeSelect.Option>Disabled</NativeSelect.Option>
	</NativeSelect.Root>
	<NativeSelect.Root aria-invalid="true">
		<NativeSelect.Option>Invalid</NativeSelect.Option>
	</NativeSelect.Root>
{/snippet}

<Examples
	items={[
		{ title: "Basic", demo: demoBasic, code: usage },
		{
			title: "Groups",
			demo: demoGroups,
			code: codeGroups,
			description: "OptGroup renders a native <optgroup> with its label.",
		},
		{ title: "Sizes", demo: demoSizes, code: codeSizes },
		{
			title: "States",
			demo: demoStates,
			code: codeStates,
			description: "Disabling the select dims the chevron too, via :has() on the wrapper.",
		},
	]}
/>

## Props

`Root` takes every native `<select>` attribute; `Option` and `OptGroup` take theirs.

<PropsTable {props} />

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--input` | control background, at 50% |
| `--muted-foreground` | the chevron |
| `--ring` | focus border and ring |
| `--destructive` | border and ring when `aria-invalid` |
| `--primary` / `--primary-foreground` | text selection inside the control |

</div>

Options use the system `Canvas` and `CanvasText` colours rather than our tokens. The dropdown
list is painted by the operating system, not the page, so system colours keep it legible when
the page theme and the OS theme disagree.
