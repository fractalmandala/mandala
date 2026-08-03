<script lang="ts">
	import { Switch } from "$lib/components/switch/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let airplaneMode = $state(false);
	let notifications = $state(true);

	const props: PropRow[] = [
		{
			name: "checked",
			type: "boolean",
			default: "false",
			description: "Bindable checked state.",
		},
		{
			name: "size",
			type: '"sm" | "default"',
			default: '"default"',
			description: "Control dimensions. Rendered as data-size.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the switch and blocks interaction.",
		},
		{
			name: "required",
			type: "boolean",
			default: "false",
			description: "Marks the switch as required for form validation.",
		},
		{
			name: "name",
			type: "string",
			description: "Name used for form submission.",
		},
		{
			name: "value",
			type: "any",
			description: "Submitted value when the switch is checked.",
		},
		{
			name: "aria-invalid",
			type: "boolean",
			description: "Switches the border and focus ring to the destructive colour.",
		},
		{
			name: "ref",
			type: "HTMLButtonElement | null",
			default: "null",
			description: "Bindable reference to the root button.",
		},
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import { Switch } from "fractalsvelte/switch";

  let checked = $state(false);
<\/script>

<Switch id="airplane-mode" bind:checked />
<label for="airplane-mode">Airplane Mode</label>`;

	const codeBasic = `<Switch id="airplane-mode" />
<label for="airplane-mode">Airplane Mode</label>`;

	const codeSizes = `<Switch id="switch-size-sm" size="sm" />
<label for="switch-size-sm">Small</label>

<Switch id="switch-size-default" />
<label for="switch-size-default">Default</label>`;

	const codeDisabled = `<Switch id="switch-disabled-unchecked" disabled />
<label for="switch-disabled-unchecked">Disabled unchecked</label>

<Switch id="switch-disabled-checked" checked disabled />
<label for="switch-disabled-checked">Disabled checked</label>`;

	const codeDescription = `<label for="sync-focus">
  <span>Share across devices</span>
  <span>Focus is shared across devices and turns off when you leave the app.</span>
</label>
<Switch id="sync-focus" />`;

	const codeInvalid = `<Switch id="switch-invalid" aria-invalid="true" />
<label for="switch-invalid">Invalid state</label>`;
</script>

<h1 class="doc-title">Switch</h1>
<p class="doc-lede">A control that toggles between checked and unchecked states.</p>

<Preview description="Switch — labelled control" code={usage}>
	<div class="row ycenter" style="gap:0.5rem">
		<Switch id="airplane-mode-preview" bind:checked={airplaneMode} />
		<label for="airplane-mode-preview">Airplane Mode</label>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/switch/` into your project. It depends on `bits-ui`, and it expects
the library tokens and reset styles to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoBasic()}

<div class="row ycenter" style="gap:0.5rem">
	<Switch id="airplane-mode-basic" bind:checked={airplaneMode} />
	<label for="airplane-mode-basic">Airplane Mode</label>
</div>
{/snippet}

{#snippet demoSizes()}

<div class="box" style="gap:1rem">
	<div class="row ycenter" style="gap:0.5rem">
		<Switch id="switch-size-sm" size="sm" />
		<label for="switch-size-sm">Small</label>
	</div>
	<div class="row ycenter" style="gap:0.5rem">
		<Switch id="switch-size-default" />
		<label for="switch-size-default">Default</label>
	</div>
</div>
{/snippet}

{#snippet demoDisabled()}

<div class="box" style="gap:1rem">
	<div class="row ycenter" style="gap:0.5rem">
		<Switch id="switch-disabled-unchecked" disabled />
		<label for="switch-disabled-unchecked">Disabled unchecked</label>
	</div>
	<div class="row ycenter" style="gap:0.5rem">
		<Switch id="switch-disabled-checked" checked disabled />
		<label for="switch-disabled-checked">Disabled checked</label>
	</div>
</div>
{/snippet}

{#snippet demoDescription()}

<div class="row ycenter xbetween" style="gap:1rem; width:min(100%, 24rem)">
	<label for="sync-focus" class="box" style="gap:0.25rem">
		<span>Share across devices</span>
		<span>Focus is shared across devices and turns off when you leave the app.</span>
	</label>
	<Switch id="sync-focus" bind:checked={notifications} />
</div>
{/snippet}

{#snippet demoInvalid()}

<div class="row ycenter" style="gap:0.5rem">
	<Switch id="switch-invalid" aria-invalid="true" />
	<label for="switch-invalid">Invalid state</label>
</div>
{/snippet}

<Examples
items={[
{ title: "Basic", demo: demoBasic, code: codeBasic },
{ title: "Sizes", demo: demoSizes, code: codeSizes },
{ title: "Disabled", demo: demoDisabled, code: codeDisabled },
{ title: "Description", demo: demoDescription, code: codeDescription },
{ title: "Invalid", demo: demoInvalid, code: codeInvalid },
]}
/>

## Props

<PropsTable {props} />

## Theming

Switch reads `--primary`, `--primary-foreground`, `--background`, `--foreground`, `--input`,
`--ring` and `--destructive`. The unchecked track uses `--input`, the checked track uses
`--primary`, and focus and invalid states use the shared ring tokens.
