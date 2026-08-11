<script lang="ts">
	import { Input } from "$lib/components/input/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let email = $state("");

	const props: PropRow[] = [
		{
			name: "value",
			type: "string | number",
			description: "Bindable. Use bind:value for two-way binding.",
		},
		{
			name: "type",
			type: 'HTMLInputTypeAttribute',
			default: '"text"',
			description: 'Any native input type. Setting type="file" also enables the files prop.',
		},
		{
			name: "files",
			type: "FileList",
			description: 'Bindable. Only available when type="file".',
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the field and blocks interaction.",
		},
		{
			name: "aria-invalid",
			type: "boolean",
			description: "Switches the border and focus ring to the destructive colour.",
		},
		{
			name: "placeholder",
			type: "string",
			description: "Rendered in the muted foreground colour.",
		},
		{
			name: "data-slot",
			type: "string",
			default: '"input"',
			description:
				"The styling hook. Wrappers override it to opt the field out of the default input styling.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the rendered input.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Input } from "fractalsvelte/input";

  let email = $state("");
<\/script>

<Input type="email" placeholder="Email" bind:value={email} />`;

	const codeStates = `<Input placeholder="Default" />
<Input placeholder="Disabled" disabled />
<Input placeholder="Invalid" aria-invalid="true" />`;

	const codeTypes = `<Input type="email" placeholder="you@example.com" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="0" />
<Input type="date" />`;

	const codeFile = `<Input type="file" />`;

	const codeBind = `<script lang="ts">
  let email = $state("");
<\/script>

<Input type="email" placeholder="Email" bind:value={email} />
<p>{email}</p>`;
</script>

<h1 class="doc-title">Input</h1>
<p class="doc-lede">A single-line text field.</p>

<Preview description="Input — default" code={usage}>
	<Input placeholder="Email" style="max-width:20rem" />
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/input/` into your project — it has no runtime dependencies.
Copy `styles/_mixins.sass` and `_tokens.sass` too if you do not already have them.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoStates()}
	<div class="box" style="gap:0.625rem; width:20rem">
		<Input placeholder="Default" />
		<Input placeholder="Disabled" disabled />
		<Input placeholder="Invalid" aria-invalid="true" />
		<Input value="With a value" />
	</div>
{/snippet}

{#snippet demoTypes()}
	<div class="box" style="gap:0.625rem; width:20rem">
		<Input type="email" placeholder="you@example.com" />
		<Input type="password" placeholder="Password" />
		<Input type="number" placeholder="0" />
		<Input type="date" />
	</div>
{/snippet}

{#snippet demoFile()}
	<div style="width:20rem">
		<Input type="file" />
	</div>
{/snippet}

{#snippet demoBind()}
	<div class="box" style="gap:0.625rem; width:20rem">
		<Input type="email" placeholder="Type something" bind:value={email} />
		<span style="font-size:0.8125rem; color:var(--muted-foreground)">
			{email || "…"}
		</span>
	</div>
{/snippet}

<Examples
	items={[
		{ title: "States", demo: demoStates, code: codeStates },
		{ title: "Types", demo: demoTypes, code: codeTypes },
		{
			title: "File",
			demo: demoFile,
			code: codeFile,
			description: 'type="file" also exposes a bindable files prop.',
		},
		{
			title: "Two-way binding",
			demo: demoBind,
			code: codeBind,
			description: "Type in the field — value is bindable.",
		},
	]}
/>

## Props

Every native `<input>` attribute is forwarded. The table lists what is specific to this
component.

<PropsTable {props} />

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--input` | field background, at 50% |
| `--muted-foreground` | placeholder |
| `--ring` | focus border and ring |
| `--destructive` | border and ring when `aria-invalid` |
| `--text-base` | field text size |

</div>

Setting `aria-invalid="true"` is all that is needed for error styling — no prop, so form
libraries that already manage that attribute work unchanged.
