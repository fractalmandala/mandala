<script lang="ts">
	import { Slider } from "$lib/components/slider/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let singleValue = $state(50);
	let multipleValue = $state([25, 75]);
	let verticalValue = $state(50);
	let controlledValue = $state([0.3, 0.7]);

	const props: PropRow[] = [
		{
			name: "type",
			type: '"single" | "multiple"',
			description: "Required slider mode. Single sliders use a number value; multiple sliders use a number array.",
		},
		{
			name: "value",
			type: "number | number[]",
			description: "Bindable slider value. The type follows the selected slider mode.",
		},
		{
			name: "min",
			type: "number",
			default: "0",
			description: "Minimum selectable value.",
		},
		{
			name: "max",
			type: "number",
			default: "100",
			description: "Maximum selectable value.",
		},
		{
			name: "step",
			type: "number | number[]",
			default: "1",
			description: "Keyboard and drag increment, or an explicit list of allowed values.",
		},
		{
			name: "orientation",
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description: "Axis used by the track, range and thumbs.",
		},
		{
			name: "maxWidth",
			type: "string",
			description: "CSS max-width for the root element. Omit to fill the available width.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the slider and blocks interaction.",
		},
		{
			name: "dir",
			type: '"ltr" | "rtl"',
			default: '"ltr"',
			description: "Reading direction for keyboard and value movement.",
		},
		{
			name: "thumbPositioning",
			type: '"contain" | "overflow"',
			default: '"contain"',
			description: "Controls how thumbs are positioned at the track edges.",
		},
		{
			name: "trackPadding",
			type: "number",
			description: "Percentage padding before the first and after the last tick position.",
		},
		{
			name: "ref",
			type: "HTMLSpanElement | null",
			default: "null",
			description: "Bindable reference to the root element.",
		},
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import { Slider } from "fractalsvelte/slider";

  let value = $state(33);
<\/script>

<Slider type="single" bind:value max={100} step={1} />`;

	const codeSingle = `<script lang="ts">
  import { Slider } from "fractalsvelte/slider";

  let value = $state(50);
<\/script>

<Slider type="single" bind:value max={100} step={1} maxWidth="70%" />`;

	const codeMultiple = `<script lang="ts">
  import { Slider } from "fractalsvelte/slider";

  let value = $state([25, 75]);
<\/script>

<Slider type="multiple" bind:value max={100} step={1} maxWidth="70%" />`;

	const codeVertical = `<script lang="ts">
  import { Slider } from "fractalsvelte/slider";

  let value = $state(50);
<\/script>

<Slider type="single" orientation="vertical" bind:value max={100} step={1} />`;

	const codeControlled = `<script lang="ts">
  import { Slider } from "fractalsvelte/slider";

  let value = $state([0.3, 0.7]);
<\/script>

<div class="box" style="gap:0.75rem; width:min(100%, 24rem)">
  <div class="row" style="align-items:center; justify-content:space-between; gap:1rem">
    <label for="temperature">Temperature</label>
    <span>{value.join(", ")}</span>
  </div>
  <Slider id="temperature" type="multiple" bind:value min={0} max={1} step={0.1} />
</div>`;

	const codeDisabled = `<Slider type="single" value={50} max={100} step={1} disabled />`;
</script>

<h1 class="doc-title">Slider</h1>
<p class="doc-lede">An input where the user selects one or more values from a bounded range.</p>

<Preview description="Slider — single value" code={usage}>
	<Slider type="single" bind:value={singleValue} max={100} step={1} maxWidth="70%" />
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/slider/` into your project. It depends on `bits-ui`, and it
expects the library tokens and reset styles to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoSingle()}
<Slider type="single" bind:value={singleValue} max={100} step={1} maxWidth="70%" />
{/snippet}

{#snippet demoMultiple()}
<Slider type="multiple" bind:value={multipleValue} max={100} step={1} maxWidth="70%" />
{/snippet}

{#snippet demoVertical()}

<div style="height:12rem">
<Slider type="single" orientation="vertical" bind:value={verticalValue} max={100} step={1} />
</div>
{/snippet}

{#snippet demoControlled()}

<div class="box" style="gap:0.75rem; width:min(100%, 24rem)">
<div class="row" style="align-items:center; justify-content:space-between; gap:1rem">
<label for="slider-temperature" style="font-size:var(--text-sm); line-height:var(--text-sm--line-height); font-weight:500">Temperature</label>
<span style="color:var(--muted-foreground); font-size:var(--text-sm); line-height:var(--text-sm--line-height)">{controlledValue.join(", ")}</span>
</div>
<Slider
	id="slider-temperature"
	type="multiple"
	bind:value={controlledValue}
	min={0}
	max={1}
	step={0.1}
/>
</div>
{/snippet}

{#snippet demoDisabled()}
<Slider type="single" value={50} max={100} step={1} disabled maxWidth="70%" />
{/snippet}

<Examples
items={[
{ title: "Single", demo: demoSingle, code: codeSingle },
{ title: "Multiple", demo: demoMultiple, code: codeMultiple },
{ title: "Vertical", demo: demoVertical, code: codeVertical },
{ title: "Controlled", demo: demoControlled, code: codeControlled },
{ title: "Disabled", demo: demoDisabled, code: codeDisabled },
]}
/>

## Props

<PropsTable {props} />

## Theming

Slider reads `--input` for the track, `--primary` for the filled range, `--background` for the
thumb surface, `--foreground` for subtle thumb shadow colour and `--ring` for hover and
focus-visible rings.
