<script lang="ts">
	import { Checkbox } from "$lib/components/checkbox/index.js";
	import * as Table from "$lib/components/table/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let agreed = $state(false);
	let compact = $state(true);
	let selectedRows = $state(["1"]);

	const rows = [
		{ id: "1", name: "Sarah Chen", email: "sarah.chen@example.com", role: "Admin" },
		{ id: "2", name: "Marcus Rodriguez", email: "marcus.rodriguez@example.com", role: "User" },
		{ id: "3", name: "Priya Patel", email: "priya.patel@example.com", role: "Editor" },
	];

	const selectAll = $derived(selectedRows.length === rows.length);
	const selectSome = $derived(selectedRows.length > 0 && selectedRows.length < rows.length);

	function setAll(checked: boolean) {
		selectedRows = checked ? rows.map((row) => row.id) : [];
	}

	function setRow(id: string, checked: boolean) {
		selectedRows = checked
			? Array.from(new Set([...selectedRows, id]))
			: selectedRows.filter((rowId) => rowId !== id);
	}

	const props: PropRow[] = [
		{
			name: "checked",
			type: "boolean",
			default: "false",
			description: "Bindable checked state.",
		},
		{
			name: "indeterminate",
			type: "boolean",
			default: "false",
			description: "Bindable mixed state. Rendered with the minus indicator.",
		},
		{
			name: "size",
			type: '"sm" | "default" | "lg"',
			default: '"default"',
			description: "Control dimensions and indicator icon size. Rendered as data-size.",
		},
		{
			name: "radius",
			type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
			description: "Corner radius. Omit to keep the skin's 5px radius.",
		},
		{
			name: "tone",
			type: '"default" | "accent"',
			default: '"default"',
			description: "Checked fill treatment. Rendered as data-tone.",
		},
		{
			name: "checkedIcon",
			type: "Snippet",
			description: "Icon shown when checked. Omit to use the built-in check.",
		},
		{
			name: "indeterminateIcon",
			type: "Snippet",
			description: "Icon shown when indeterminate. Omit to use the built-in minus.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the control and blocks interaction.",
		},
		{
			name: "readonly",
			type: "boolean",
			default: "false",
			description: "Keeps the control focusable while preventing state changes.",
		},
		{
			name: "required",
			type: "boolean",
			default: "false",
			description: "Marks the checkbox as required for form validation.",
		},
		{
			name: "name",
			type: "string",
			description: "Name used for form submission.",
		},
		{
			name: "value",
			type: "string",
			description: "Submitted value and group identity.",
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
			description: "Bindable reference to the root button.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Checkbox } from "fractalsvelte/checkbox";

  let checked = $state(false);
<\/script>

<Checkbox id="terms" bind:checked />
<label for="terms">Accept terms and conditions</label>`;

	const codeStates = `<Checkbox id="terms" />
<Checkbox id="terms-checked" checked />
<Checkbox id="terms-disabled" disabled />
<Checkbox id="terms-invalid" aria-invalid="true" />`;

	const codeWithText = `<div class="row" style="align-items:flex-start; gap:0.75rem">
  <Checkbox id="terms" checked />
  <div class="box" style="gap:0.375rem">
    <label for="terms">Accept terms and conditions</label>
    <p>You agree to our Terms of Service and Privacy Policy.</p>
  </div>
</div>`;

	const codeSizes = `<Checkbox size="sm" checked aria-label="Small" />
<Checkbox checked aria-label="Default" />
<Checkbox size="lg" checked aria-label="Large" />`;

	const codeTones = `<Checkbox checked aria-label="Default tone" />
<Checkbox checked tone="accent" aria-label="Accent tone" />`;

	const codeTable = `<Checkbox
  checked={selectAll}
  indeterminate={selectSome}
  onCheckedChange={setAll}
  aria-label="Select all"
/>`;

	const codeCustomIcons = `{#snippet diamondIcon()}
  <svg viewBox="0 0 24 24"><path d="m12 3 9 9-9 9-9-9 9-9Z" /></svg>
{/snippet}

<Checkbox checked checkedIcon={diamondIcon} aria-label="Custom icon" />`;
</script>

<h1 class="doc-title">Checkbox</h1>
<p class="doc-lede">A control that toggles between checked, unchecked and indeterminate states.</p>

<Preview description="Checkbox — with label" code={usage}>
	<div class="row" style="align-items:center; gap:0.75rem">
		<Checkbox id="terms-preview" bind:checked={agreed} />
		<label for="terms-preview" style="font-size:var(--text-sm); line-height:var(--text-sm--line-height)">
			Accept terms and conditions
		</label>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/checkbox/` into your project. It
expects `styles/_mixins.sass`, `_tokens.sass` and `_typography.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoStates()}
<div class="box" style="gap:1rem">
<div class="row" style="align-items:center; gap:0.75rem">
<Checkbox id="checkbox-default" />
<label for="checkbox-default">Unchecked</label>
</div>
<div class="row" style="align-items:center; gap:0.75rem">
<Checkbox id="checkbox-checked" checked />
<label for="checkbox-checked">Checked</label>
</div>
<div class="row" style="align-items:center; gap:0.75rem">
<Checkbox id="checkbox-disabled" disabled />
<label for="checkbox-disabled">Disabled</label>
</div>
<div class="row" style="align-items:center; gap:0.75rem">
<Checkbox id="checkbox-invalid" aria-invalid="true" />
<label for="checkbox-invalid">Invalid</label>
</div>
</div>
{/snippet}

{#snippet demoWithText()}
<div class="row" style="align-items:flex-start; gap:0.75rem; max-width:26rem">
<Checkbox id="checkbox-text" checked />
<div class="box" style="gap:0.375rem">
<label for="checkbox-text" style="font-weight:500">Accept terms and conditions</label>
<p style="color:var(--muted-foreground); font-size:var(--text-sm); line-height:var(--text-sm--line-height)">
You agree to our Terms of Service and Privacy Policy.
</p>
</div>
</div>
{/snippet}

{#snippet demoSizes()}
<div class="row" style="align-items:center; gap:1rem">
<Checkbox size="sm" checked aria-label="Small checkbox" />
<Checkbox checked aria-label="Default checkbox" />
<Checkbox size="lg" checked aria-label="Large checkbox" />
</div>
{/snippet}

{#snippet demoTones()}
<label
		for="checkbox-tone"
		class="row"
		style="align-items:flex-start; gap:0.75rem; max-width:26rem; padding:0.75rem; border:1px solid var(--border); border-radius:var(--radius); background:color-mix(in oklab, var(--accent) 45%, transparent)"
	>
<Checkbox id="checkbox-tone" bind:checked={compact} tone="accent" />
<span class="box" style="gap:0.375rem">
<span style="font-weight:500">Enable compact notifications</span>
<span style="color:var(--muted-foreground); font-size:var(--text-sm); line-height:var(--text-sm--line-height)">
Use a denser notification layout for high-volume inboxes.
</span>
</span>
</label>
{/snippet}

{#snippet demoTable()}
<Table.Root style="width:min(100%,38rem)">
<Table.Header>
<Table.Row>
<Table.Head>
<Checkbox
						checked={selectAll}
						indeterminate={selectSome}
						onCheckedChange={setAll}
						aria-label="Select all"
					/>
</Table.Head>
<Table.Head>Name</Table.Head>
<Table.Head>Email</Table.Head>
<Table.Head>Role</Table.Head>
</Table.Row>
</Table.Header>
<Table.Body>
{#each rows as row (row.id)}
<Table.Row data-state={selectedRows.includes(row.id) ? "selected" : undefined}>
<Table.Cell>
<Checkbox
checked={selectedRows.includes(row.id)}
onCheckedChange={(checked) => setRow(row.id, checked)}
aria-label={`Select ${row.name}`}
/>
</Table.Cell>
<Table.Cell>{row.name}</Table.Cell>
<Table.Cell>{row.email}</Table.Cell>
<Table.Cell>{row.role}</Table.Cell>
</Table.Row>
{/each}
</Table.Body>
</Table.Root>
{/snippet}

{#snippet diamondIcon()}
<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
<path d="m12 3 9 9-9 9-9-9 9-9Z" />
</svg>
{/snippet}

{#snippet demoCustomIcons()}
<div class="row" style="align-items:center; gap:1rem">
<Checkbox checked checkedIcon={diamondIcon} aria-label="Custom checked icon" />
<Checkbox indeterminate checkedIcon={diamondIcon} aria-label="Indeterminate checkbox" />
</div>
{/snippet}

<Examples
items={[
{ title: "States", demo: demoStates, code: codeStates },
{ title: "With text", demo: demoWithText, code: codeWithText },
{ title: "Sizes", demo: demoSizes, code: codeSizes },
{ title: "Tone", demo: demoTones, code: codeTones },
{
title: "In table",
demo: demoTable,
code: codeTable,
description: "The header checkbox uses indeterminate when only some rows are selected.",
},
{ title: "Custom icons", demo: demoCustomIcons, code: codeCustomIcons },
]}
/>

## Props

Every native button attribute is forwarded. The table lists the
component-specific surface and the most common state props.

<PropsTable {props} />

## Theming

Checkbox reads these tokens. Override them on `:root`, or on any ancestor to scope a theme.

<div class="doc-table-wrap">

| Token                                | Used for                               |
| ------------------------------------ | -------------------------------------- |
| `--input`                            | unchecked control background           |
| `--primary` / `--primary-foreground` | checked and indeterminate default fill |
| `--accent` / `--accent-foreground`   | `accent` tone fill                     |
| `--ring`                             | focus-visible border and ring          |
| `--destructive`                      | invalid border and ring                |
| `--radius`                           | radius override scale                  |

</div>
