<script lang="ts">
	import { onMount } from "svelte";
	import { Progress } from "$lib/components/progress/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let loading = $state(13);

	onMount(() => {
		const timer = window.setTimeout(() => (loading = 66), 500);
		return () => window.clearTimeout(timer);
	});

	const props: PropRow[] = [
		{
			name: "value",
			type: "number | null",
			default: "0",
			description: "Current progress value. Set to null for an indeterminate ARIA state.",
		},
		{
			name: "max",
			type: "number",
			default: "100",
			description: "Maximum progress value.",
		},
		{
			name: "min",
			type: "number",
			default: "0",
			description: "Minimum progress value used when calculating the indicator transform.",
		},
		{
			name: "width",
			type: "string",
			description: "CSS width for the root element. Omit to fill the available width.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the root element.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Progress } from "fractalsvelte/progress";
<\/script>

<Progress value={66} max={100} />`;

	const codeDemo = `<script lang="ts">
  import { onMount } from "svelte";
  import { Progress } from "fractalsvelte/progress";

  let value = $state(13);

  onMount(() => {
    const timer = window.setTimeout(() => (value = 66), 500);
    return () => window.clearTimeout(timer);
  });
<\/script>

<Progress {value} max={100} width="60%" />`;

	const codeWidth = `<Progress value={42} width="16rem" />
<Progress value={72} width="100%" />`;

	const codeRange = `<Progress value={32} min={20} max={80} />`;
</script>

<h1 class="doc-title">Progress</h1>
<p class="doc-lede">A horizontal indicator for showing task completion.</p>

<Preview description="Progress — animated value" code={usage}>
	<Progress value={loading} max={100} width="60%" />
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/progress/` into your project. It
expects the library tokens and typography styles to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoDemo()}
<Progress value={loading} max={100} width="60%" />
{/snippet}

{#snippet demoWidth()}

<div class="box" style="gap:1rem; width:min(100%, 24rem)">
	<Progress value={42} width="16rem" />
	<Progress value={72} width="100%" />
</div>
{/snippet}

{#snippet demoRange()}
<Progress value={32} min={20} max={80} width="18rem" />
{/snippet}

<Examples
items={[
{ title: "Demo", demo: demoDemo, code: codeDemo },
{ title: "Width", demo: demoWidth, code: codeWidth },
{ title: "Range", demo: demoRange, code: codeRange },
]}
/>

## Props

<PropsTable {props} />

## Theming

Progress reads `--muted` for the track, `--primary` for the indicator and the shared text
scale tokens through the surrounding document chrome. The root fills its container by
default; set `width` when the progress bar needs its own fixed or percentage width.
