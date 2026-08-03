<script lang="ts">
	import * as Select from "$lib/components/select/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const fruits = [
		{ value: "apple", label: "Apple" },
		{ value: "banana", label: "Banana" },
		{ value: "blueberry", label: "Blueberry" },
		{ value: "grapes", label: "Grapes", disabled: true },
		{ value: "pineapple", label: "Pineapple" },
	];

	const emails = [
		{ value: "m@example.com", label: "m@example.com" },
		{ value: "m@google.com", label: "m@google.com" },
		{ value: "m@support.com", label: "m@support.com" },
	];

	const zones = {
		"North America": [
			["est", "Eastern Standard Time (EST)"],
			["cst", "Central Standard Time (CST)"],
			["mst", "Mountain Standard Time (MST)"],
			["pst", "Pacific Standard Time (PST)"],
			["akst", "Alaska Standard Time (AKST)"],
			["hst", "Hawaii Standard Time (HST)"],
		],
		"Europe & Africa": [
			["gmt", "Greenwich Mean Time (GMT)"],
			["cet", "Central European Time (CET)"],
			["eet", "Eastern European Time (EET)"],
			["west", "Western European Summer Time (WEST)"],
			["cat", "Central Africa Time (CAT)"],
			["eat", "East Africa Time (EAT)"],
		],
		Asia: [
			["msk", "Moscow Time (MSK)"],
			["ist", "India Standard Time (IST)"],
			["cst_china", "China Standard Time (CST)"],
			["jst", "Japan Standard Time (JST)"],
			["kst", "Korea Standard Time (KST)"],
			["ist_indonesia", "Indonesia Central Standard Time (WITA)"],
		],
		"Australia & Pacific": [
			["awst", "Australian Western Standard Time (AWST)"],
			["acst", "Australian Central Standard Time (ACST)"],
			["aest", "Australian Eastern Standard Time (AEST)"],
			["nzst", "New Zealand Standard Time (NZST)"],
			["fjt", "Fiji Time (FJT)"],
		],
		"South America": [
			["art", "Argentina Time (ART)"],
			["bot", "Bolivia Time (BOT)"],
			["brt", "Brasilia Time (BRT)"],
			["clt", "Chile Standard Time (CLT)"],
		],
	};

	let fruit = $state("");
	let email = $state("");
	let timezone = $state("");

	const fruitLabel = $derived(fruits.find((item) => item.value === fruit)?.label ?? "Select a fruit");
	const emailLabel = $derived(email || "Select a verified email");
	const timezoneLabel = $derived(timezone || "Select a timezone");

	const props: PropRow[] = [
		{
			name: "type",
			type: '"single" | "multiple"',
			description: "Selection mode passed to the root primitive.",
		},
		{
			name: "value",
			type: "string | string[]",
			description: "Bindable selected value. A single select uses string; a multiple select uses string[].",
		},
		{
			name: "open",
			type: "boolean",
			default: "false",
			description: "Bindable open state for the popup.",
		},
		{
			name: "items",
			type: "{ value: string; label: string; disabled?: boolean }[]",
			description: "Optional item list for closed-trigger typeahead and form autofill.",
		},
		{
			name: "Trigger.size",
			type: '"sm" | "default"',
			default: '"default"',
			description: "Trigger height. Rendered as data-size.",
		},
		{
			name: "Trigger.width",
			type: "string",
			description: "Inline width for fixed-width triggers such as 180px or 17.5rem.",
		},
		{
			name: "Trigger.icon",
			type: "Snippet",
			description: "Optional chevron replacement. The default is an inline SVG.",
		},
		{
			name: "Content.maxHeight",
			type: "string",
			description: "Inline maximum height for scrollable option lists.",
		},
		{
			name: "Content.width",
			type: "string",
			description: "Inline popup width override. Omit to size from the trigger anchor.",
		},
		{
			name: "Content.portalProps",
			type: "Select.Portal props",
			description: "Props forwarded to the portal wrapping the floating content.",
		},
		{
			name: "Item.value",
			type: "string",
			description: "Required item value.",
		},
		{
			name: "Item.label",
			type: "string",
			description: "Searchable display label. Falls back to value when omitted.",
		},
		{
			name: "Item.disabled",
			type: "boolean",
			default: "false",
			description: "Disables selection and dims the item.",
		},
		{
			name: "Item.indicator",
			type: "Snippet",
			description: "Optional selected-check replacement. The default is an inline SVG.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference exposed by Select parts that render an element.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Rendered content for the selected trigger, groups, labels, and items.",
		},
	];

	const usage = `<script lang="ts">
  import * as Select from "fractalsvelte/select";
<\/script>

<Select.Root type="single">
  <Select.Trigger width="180px">Select a fruit</Select.Trigger>
  <Select.Content>
    <Select.Item value="apple">Apple</Select.Item>
  </Select.Content>
</Select.Root>`;

	const codeBasic = `<Select.Root type="single" bind:value>
  <Select.Trigger width="180px">{selectedLabel}</Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Label>Fruits</Select.Label>
      <Select.Item value="apple">Apple</Select.Item>
      <Select.Item value="banana">Banana</Select.Item>
    </Select.Group>
  </Select.Content>
</Select.Root>`;

	const codeScrollable = `<Select.Root type="single">
  <Select.Trigger width="280px">Select a timezone</Select.Trigger>
  <Select.Content maxHeight="300px">
    <Select.Group>
      <Select.Label>North America</Select.Label>
      <Select.Item value="est">Eastern Standard Time (EST)</Select.Item>
    </Select.Group>
  </Select.Content>
</Select.Root>`;

	const codeSizes = `<Select.Trigger size="sm" width="180px">Small trigger</Select.Trigger>
<Select.Trigger width="180px">Default trigger</Select.Trigger>`;

	const codeInstall = `npm i fractalsvelte`;
</script>

<h1 class="doc-title">Select</h1>
<p class="doc-lede">Displays a listbox in a floating layer for choosing one or more values.</p>

<Preview description="Single select" code={codeBasic}>
	<Select.Root type="single" bind:value={fruit} items={fruits}>
		<Select.Trigger width="180px">{fruitLabel}</Select.Trigger>
		<Select.Content>
			<Select.Group>
				<Select.Label>Fruits</Select.Label>
				{#each fruits as item (item.value)}
					<Select.Item value={item.value} label={item.label} disabled={item.disabled}>
						{item.label}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/select/` into your project. Copy `src/lib/components/separator/`,
`styles/_mixins.sass`, and `_tokens.sass` too if you do not already have them.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoBasic()}
<Select.Root type="single" bind:value={fruit} items={fruits}>
<Select.Trigger width="180px">{fruitLabel}</Select.Trigger>
<Select.Content>
<Select.Group>
<Select.Label>Fruits</Select.Label>
{#each fruits as item (item.value)}
<Select.Item value={item.value} label={item.label} disabled={item.disabled}>
{item.label}
</Select.Item>
{/each}
</Select.Group>
</Select.Content>
</Select.Root>
{/snippet}

{#snippet demoScrollable()}
<Select.Root type="single" bind:value={timezone}>
<Select.Trigger width="280px">{timezoneLabel}</Select.Trigger>
<Select.Content maxHeight="300px">
{#each Object.entries(zones) as [group, items] (group)}
<Select.Group>
<Select.Label>{group}</Select.Label>
{#each items as [value, label] (value)}
<Select.Item {value}>{label}</Select.Item>
{/each}
</Select.Group>
{/each}
</Select.Content>
</Select.Root>
{/snippet}

{#snippet demoSizes()}
<Select.Root type="single" bind:value={email} items={emails}>
<Select.Trigger size="sm" width="180px">{emailLabel}</Select.Trigger>
<Select.Content>
{#each emails as item (item.value)}
<Select.Item value={item.value}>{item.label}</Select.Item>
{/each}
</Select.Content>
</Select.Root>
<Select.Root type="single">
<Select.Trigger width="180px">Default trigger</Select.Trigger>
<Select.Content>
<Select.Item value="one">One</Select.Item>
<Select.Item value="two">Two</Select.Item>
</Select.Content>
</Select.Root>
{/snippet}

<Examples
items={[
{ title: "Basic", demo: demoBasic, code: codeBasic },
{ title: "Scrollable", demo: demoScrollable, code: codeScrollable },
{ title: "Sizes", demo: demoSizes, code: codeSizes },
]}
/>

## Props

<PropsTable {props} />

## Theming

Select reads `--input`, `--background`, `--foreground`, `--muted-foreground`, `--popover`,
`--popover-foreground`, `--accent`, `--accent-foreground`, `--border`, `--ring`,
`--destructive`, and the `--text-*` typography tokens.
