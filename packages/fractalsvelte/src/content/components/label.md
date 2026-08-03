<script lang="ts">
	import { Checkbox } from "$lib/components/checkbox/index.js";
	import { Label } from "$lib/components/label/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let accepted = $state(false);
	let grouped = $state(true);

	const props: PropRow[] = [
		{
			name: "for",
			type: "string",
			description: "Associates the label with the control that has the matching id.",
		},
		{
			name: "child",
			type: "Snippet",
			description: "Renders a custom element with the label behaviour and attributes applied.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Label contents.",
		},
		{
			name: "ref",
			type: "HTMLLabelElement | null",
			default: "null",
			description: "Bindable reference to the rendered label element.",
		},
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import { Label } from "fractalsvelte/label";
<\/script>

<Label for="email">Your email address</Label>`;

	const codeBasic = `<div class="row" style="align-items:center; gap:0.75rem">
  <Checkbox id="terms" />
  <Label for="terms">Accept terms and conditions</Label>
</div>`;

	const codeWithDescription = `<div class="row" style="align-items:flex-start; gap:0.75rem">
  <Checkbox id="notifications" checked />
  <div class="box" style="gap:0.375rem">
    <Label for="notifications">Email notifications</Label>
    <p>Receive release notes and account alerts.</p>
  </div>
</div>`;

	const codeDisabled = `<div class="group row" data-disabled="true" style="align-items:center; gap:0.75rem">
  <Checkbox id="disabled-label" disabled />
  <Label for="disabled-label">Disabled option</Label>
</div>`;
</script>

<h1 class="doc-title">Label</h1>
<p class="doc-lede">An accessible text label associated with a form control.</p>

<Preview description="Label — with checkbox" code={codeBasic}>
	<div class="row" style="align-items:center; gap:0.75rem">
		<Checkbox id="label-preview" bind:checked={accepted} />
		<Label for="label-preview">Accept terms and conditions</Label>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/label/` into your project. It depends on `bits-ui`, and it expects
the shared typography tokens to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoBasic()}

<div class="row" style="align-items:center; gap:0.75rem">
<Checkbox id="label-basic" bind:checked={accepted} />
<Label for="label-basic">Accept terms and conditions</Label>
</div>
{/snippet}

{#snippet demoWithDescription()}

<div class="row" style="align-items:flex-start; gap:0.75rem; max-width:26rem">
<Checkbox id="label-description" bind:checked={grouped} />
<div class="box" style="gap:0.375rem">
<Label for="label-description">Email notifications</Label>
<p style="color:var(--muted-foreground); font-size:var(--text-sm); line-height:var(--text-sm--line-height)">
Receive release notes and account alerts.
</p>
</div>
</div>
{/snippet}

{#snippet demoDisabled()}

<div class="group row" data-disabled="true" style="align-items:center; gap:0.75rem">
<Checkbox id="label-disabled" disabled />
<Label for="label-disabled">Disabled option</Label>
</div>
{/snippet}

<Examples
items={[
{
title: "Basic",
demo: demoBasic,
code: codeBasic,
},
{
title: "Description",
demo: demoWithDescription,
code: codeWithDescription,
description: "Place supporting text near the labelled control while the label keeps its control association.",
},
{
title: "Disabled group",
demo: demoDisabled,
code: codeDisabled,
description: "A disabled group dims the label and prevents pointer interaction.",
},
]}
/>

## Props

<PropsTable {props} />

## Theming

Label reads `--text-sm` and `--text-sm--line-height` from the shared type scale. Disabled
states inherit the surrounding foreground colour and lower opacity.
