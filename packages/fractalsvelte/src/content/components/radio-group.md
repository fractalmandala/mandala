<script lang="ts">
	import { Label } from "$lib/components/label/index.js";
	import * as RadioGroup from "$lib/components/radio-group/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let density = $state("comfortable");
	let notifications = $state("mentions");
	let invalidChoice = $state("none");

	const props: PropRow[] = [
		{
			name: "Root value",
			type: "string",
			default: '""',
			description: "Bindable selected item value.",
		},
		{
			name: "orientation",
			type: '"horizontal" | "vertical"',
			default: '"vertical"',
			description: "Keyboard navigation direction passed to the root.",
		},
		{
			name: "loop",
			type: "boolean",
			default: "true",
			description: "Whether keyboard navigation wraps at the ends.",
		},
		{
			name: "name",
			type: "string",
			description: "Name used for form submission when hidden inputs are rendered.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Disables the whole group or an individual item.",
		},
		{
			name: "readonly",
			type: "boolean",
			default: "false",
			description: "Keeps items focusable while preventing value changes.",
		},
		{
			name: "required",
			type: "boolean",
			default: "false",
			description: "Marks the group as required for form submission.",
		},
		{
			name: "Item value",
			type: "string",
			description: "Item value. Required on RadioGroup.Item.",
		},
		{
			name: "indicator",
			type: "Snippet",
			description: "Custom selected indicator for RadioGroup.Item. Omit to use the built-in dot.",
		},
		{
			name: "aria-invalid",
			type: "boolean",
			description: "Switches an item to the destructive border and ring treatment.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Group contents or item snippet contents.",
		},
		{
			name: "child",
			type: "Snippet",
			description: "Renders a custom element with the item behaviour and attributes applied.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | HTMLButtonElement | null",
			default: "null",
			description: "Bindable reference to the root group or item button.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Label } from "fractalsvelte/label";
  import * as RadioGroup from "fractalsvelte/radio-group";
<\/script>

<RadioGroup.Root value="comfortable">
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="default" id="default" />
    <Label for="default">Default</Label>
  </div>
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="comfortable" id="comfortable" />
    <Label for="comfortable">Comfortable</Label>
  </div>
</RadioGroup.Root>`;

	const codeBasic = `<RadioGroup.Root value="comfortable">
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="default" id="r1" />
    <Label for="r1">Default</Label>
  </div>
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="comfortable" id="r2" />
    <Label for="r2">Comfortable</Label>
  </div>
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="compact" id="r3" />
    <Label for="r3">Compact</Label>
  </div>
</RadioGroup.Root>`;

	const codeHorizontal = `<RadioGroup.Root orientation="horizontal" value="mentions" class="row" style="gap:1rem">
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="all" id="all" />
    <Label for="all">All</Label>
  </div>
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="mentions" id="mentions" />
    <Label for="mentions">Mentions</Label>
  </div>
</RadioGroup.Root>`;

	const codeInvalid = `<RadioGroup.Root value="none" aria-label="Notification preference">
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="none" id="invalid-none" aria-invalid="true" />
    <Label for="invalid-none">Nothing</Label>
  </div>
</RadioGroup.Root>`;

	const codeCustomIndicator = `{#snippet ringIndicator()}
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="5" cy="5" r="4" />
  </svg>
{/snippet}

<RadioGroup.Item value="custom" indicator={ringIndicator} aria-label="Custom" />`;
</script>

<h1 class="doc-title">Radio Group</h1>
<p class="doc-lede">A set of checkable controls where one option can be selected at a time.</p>

<Preview description="Radio Group — density setting" code={usage}>
	<RadioGroup.Root bind:value={density}>
		<div class="row" style="align-items:center; gap:0.5rem">
			<RadioGroup.Item value="default" id="density-default-preview" />
			<Label for="density-default-preview">Default</Label>
		</div>
		<div class="row" style="align-items:center; gap:0.5rem">
			<RadioGroup.Item value="comfortable" id="density-comfortable-preview" />
			<Label for="density-comfortable-preview">Comfortable</Label>
		</div>
		<div class="row" style="align-items:center; gap:0.5rem">
			<RadioGroup.Item value="compact" id="density-compact-preview" />
			<Label for="density-compact-preview">Compact</Label>
		</div>
	</RadioGroup.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/radio-group/` into your project. It
expects `styles/_mixins.sass`, `_tokens.sass` and `_typography.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoBasic()}
<RadioGroup.Root bind:value={density}>

<div class="row" style="align-items:center; gap:0.5rem">
<RadioGroup.Item value="default" id="radio-basic-default" />
<Label for="radio-basic-default">Default</Label>
</div>
<div class="row" style="align-items:center; gap:0.5rem">
<RadioGroup.Item value="comfortable" id="radio-basic-comfortable" />
<Label for="radio-basic-comfortable">Comfortable</Label>
</div>
<div class="row" style="align-items:center; gap:0.5rem">
<RadioGroup.Item value="compact" id="radio-basic-compact" />
<Label for="radio-basic-compact">Compact</Label>
</div>
</RadioGroup.Root>
{/snippet}

{#snippet demoHorizontal()}
<RadioGroup.Root bind:value={notifications} orientation="horizontal" class="row" style="gap:1rem">

<div class="row" style="align-items:center; gap:0.5rem">
<RadioGroup.Item value="all" id="radio-all" />
<Label for="radio-all">All</Label>
</div>
<div class="row" style="align-items:center; gap:0.5rem">
<RadioGroup.Item value="mentions" id="radio-mentions" />
<Label for="radio-mentions">Mentions</Label>
</div>
<div class="row" style="align-items:center; gap:0.5rem">
<RadioGroup.Item value="none" id="radio-none" />
<Label for="radio-none">None</Label>
</div>
</RadioGroup.Root>
{/snippet}

{#snippet demoInvalid()}
<RadioGroup.Root bind:value={invalidChoice} aria-label="Notification preference">

<div class="row" style="align-items:center; gap:0.5rem">
<RadioGroup.Item value="all" id="radio-invalid-all" />
<Label for="radio-invalid-all">All messages</Label>
</div>
<div class="row" style="align-items:center; gap:0.5rem">
<RadioGroup.Item value="none" id="radio-invalid-none" aria-invalid="true" />
<Label for="radio-invalid-none">Nothing</Label>
</div>
</RadioGroup.Root>
{/snippet}

{#snippet ringIndicator()}
<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2">
<circle cx="5" cy="5" r="4" />
</svg>
{/snippet}

{#snippet demoCustomIndicator()}
<RadioGroup.Root value="custom" aria-label="Custom radio indicator">
<RadioGroup.Item value="custom" indicator={ringIndicator} aria-label="Custom indicator" />
</RadioGroup.Root>
{/snippet}

<Examples
items={[
{
title: "Basic",
demo: demoBasic,
code: codeBasic,
},
{
title: "Horizontal",
demo: demoHorizontal,
code: codeHorizontal,
description: "Set orientation on the root when the choices are arranged in a row.",
},
{
title: "Invalid",
demo: demoInvalid,
code: codeInvalid,
description: "Use aria-invalid on an item to show validation state.",
},
{
title: "Custom indicator",
demo: demoCustomIndicator,
code: codeCustomIndicator,
description: "Pass an indicator snippet to replace the default selected dot.",
},
]}
/>

## Props

<PropsTable {props} />

## Theming

Radio Group reads `--input`, `--primary`, `--primary-foreground`, `--ring`, `--destructive`
and the shared foreground tokens. Focus and invalid rings use token opacity through
`color-mix`.
