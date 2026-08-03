<script lang="ts">
	import { Checkbox } from "$lib/components/checkbox/index.js";
	import * as Field from "$lib/components/field/index.js";
	import { Input } from "$lib/components/input/index.js";
	import * as RadioGroup from "$lib/components/radio-group/index.js";
	import { Switch } from "$lib/components/switch/index.js";
	import { Textarea } from "$lib/components/textarea/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let newsletter = $state(true);
	let plan = $state("monthly");
	let security = $state(false);

	const props: PropRow[] = [
		{
			name: "Field orientation",
			type: '"vertical" | "horizontal" | "responsive"',
			default: '"vertical"',
			description: "Layout direction for the field wrapper. Rendered as data-orientation.",
		},
		{
			name: "Field invalid",
			type: "boolean",
			default: "false",
			description: "Applies the destructive colour to the field group. Rendered as data-invalid.",
		},
		{
			name: "Group gap",
			type: '"default" | "compact"',
			default: '"default"',
			description: "Spacing for grouped fields. Compact matches checkbox and radio option groups.",
		},
		{
			name: "Legend variant",
			type: '"legend" | "label"',
			default: '"legend"',
			description: "Type scale for fieldset legends.",
		},
		{
			name: "Label weight",
			type: '"medium" | "normal"',
			default: '"medium"',
			description: "Label font weight. Use normal for checkbox and radio option labels.",
		},
		{
			name: "Error errors",
			type: "{ message?: string }[]",
			description: "Validation errors. A single message renders directly; multiple messages render as a list.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Content for every Field part.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the rendered root element for each Field part.",
		},
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as Field from "fractalsvelte/field";
  import { Input } from "fractalsvelte/input";
<\/script>

<Field.Set>
  <Field.Legend>Profile</Field.Legend>
  <Field.Description>This appears on invoices and account emails.</Field.Description>
  <Field.Group>
    <Field.Field>
      <Field.Label for="name">Full name</Field.Label>
      <Input id="name" placeholder="Evil Rabbit" />
      <Field.Description>Use the name your team knows.</Field.Description>
    </Field.Field>
  </Field.Group>
</Field.Set>`;

	const codeInput = `<Field.Field>
  <Field.Label for="username">Username</Field.Label>
  <Input id="username" type="text" placeholder="Max Leiter" />
  <Field.Description>Choose a unique username for your account.</Field.Description>
</Field.Field>`;

	const codeHorizontal = `<Field.Field orientation="horizontal">
  <Checkbox id="analytics" checked />
  <Field.Label for="analytics" weight="normal">Share anonymous analytics</Field.Label>
</Field.Field>`;

	const codeResponsive = `<Field.Set>
  <Field.Legend>Profile</Field.Legend>
  <Field.Description>Fields switch from stacked to side-by-side inside the group.</Field.Description>
  <Field.Separator />
  <Field.Group>
    <Field.Field orientation="responsive">
      <Field.Content>
        <Field.Label for="display-name">Display name</Field.Label>
        <Field.Description>Shown in shared workspaces and comments.</Field.Description>
      </Field.Content>
      <Input id="display-name" placeholder="Evil Rabbit" />
    </Field.Field>
  </Field.Group>
</Field.Set>`;

	const codeChoiceCard = `<RadioGroup.Root bind:value={plan}>
  <Field.Label for="plan-monthly">
    <Field.Field orientation="horizontal">
      <Field.Content>
        <Field.Title>Monthly</Field.Title>
        <Field.Description>Pay month to month.</Field.Description>
      </Field.Content>
      <RadioGroup.Item id="plan-monthly" value="monthly" />
    </Field.Field>
  </Field.Label>
</RadioGroup.Root>`;

	const codeErrors = `<Field.Field invalid>
  <Field.Label for="email">Email</Field.Label>
  <Input id="email" type="email" aria-invalid="true" value="not-an-email" />
  <Field.Error>Enter a valid email address.</Field.Error>
</Field.Field>`;

	const codeMultipleErrors = `<Field.Error errors={[
  { message: "Use at least 8 characters." },
  { message: "Include one number." },
]} />`;
</script>

<h1 class="doc-title">Field</h1>
<p class="doc-lede">Compose labels, controls, descriptions and validation messages into accessible form groups.</p>

<Preview description="Field — labelled input" code={usage}>
	<Field.Set style="width:min(100%, 28rem)">
		<Field.Legend>Profile</Field.Legend>
		<Field.Description>This appears on invoices and account emails.</Field.Description>
		<Field.Group>
			<Field.Field>
				<Field.Label for="field-preview-name">Full name</Field.Label>
				<Input id="field-preview-name" placeholder="Evil Rabbit" />
				<Field.Description>Use the name your team knows.</Field.Description>
			</Field.Field>
		</Field.Group>
	</Field.Set>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/field/` into your project. It depends on the local `label` and
`separator` components, and expects the shared tokens and type scale to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoInput()}
<Field.Field style="width:min(100%, 28rem)">
<Field.Label for="field-username">Username</Field.Label>
<Input id="field-username" type="text" placeholder="Max Leiter" />
<Field.Description>Choose a unique username for your account.</Field.Description>
</Field.Field>
{/snippet}

{#snippet demoHorizontal()}
<Field.Group gap="compact" style="width:min(100%, 28rem)">
<Field.Field orientation="horizontal">
<Checkbox id="field-analytics" bind:checked={newsletter} />
<Field.Label for="field-analytics" weight="normal">Share anonymous analytics</Field.Label>
</Field.Field>
<Field.Field orientation="horizontal">
<Switch id="field-security" bind:checked={security} />
<Field.Content>
<Field.Label for="field-security">Multi-factor authentication</Field.Label>
<Field.Description>Require a second factor when signing in.</Field.Description>
</Field.Content>
</Field.Field>
</Field.Group>
{/snippet}

{#snippet demoResponsive()}
<Field.Set style="width:min(100%, 42rem)">
<Field.Legend>Profile</Field.Legend>
<Field.Description>Fields switch from stacked to side-by-side inside the group.</Field.Description>
<Field.Separator />
<Field.Group>
<Field.Field orientation="responsive">
<Field.Content>
<Field.Label for="field-display-name">Display name</Field.Label>
<Field.Description>Shown in shared workspaces and comments.</Field.Description>
</Field.Content>
<Input id="field-display-name" placeholder="Evil Rabbit" />
</Field.Field>
<Field.Separator />
<Field.Field orientation="responsive">
<Field.Content>
<Field.Label for="field-bio">Bio</Field.Label>
<Field.Description>Keep it short enough to scan quickly.</Field.Description>
</Field.Content>
<Textarea id="field-bio" rows={3} placeholder="Design systems, tools, and strange calendars." />
</Field.Field>
</Field.Group>
</Field.Set>
{/snippet}

{#snippet demoChoiceCard()}
<RadioGroup.Root bind:value={plan} style="width:min(100%, 28rem)">
<Field.Group gap="compact">
<Field.Label for="field-plan-monthly">
<Field.Field orientation="horizontal">
<Field.Content>
<Field.Title>Monthly</Field.Title>
<Field.Description>Pay month to month with no long commitment.</Field.Description>
</Field.Content>
<RadioGroup.Item id="field-plan-monthly" value="monthly" />
</Field.Field>
</Field.Label>
<Field.Label for="field-plan-yearly">
<Field.Field orientation="horizontal">
<Field.Content>
<Field.Title>Yearly</Field.Title>
<Field.Description>Save with annual billing.</Field.Description>
</Field.Content>
<RadioGroup.Item id="field-plan-yearly" value="yearly" />
</Field.Field>
</Field.Label>
</Field.Group>
</RadioGroup.Root>
{/snippet}

{#snippet demoErrors()}

<div class="box" style="gap:1rem; width:min(100%, 28rem)">
	<Field.Field invalid>
		<Field.Label for="field-email">Email</Field.Label>
		<Input id="field-email" type="email" aria-invalid="true" value="not-an-email" />
		<Field.Error>Enter a valid email address.</Field.Error>
	</Field.Field>
	<Field.Field invalid>
		<Field.Label for="field-password">Password</Field.Label>
		<Input id="field-password" type="password" aria-invalid="true" value="short" />
		<Field.Error errors={[
			{ message: "Use at least 8 characters." },
			{ message: "Include one number." },
		]} />
	</Field.Field>
</div>
{/snippet}

<Examples
items={[
{ title: "Input", demo: demoInput, code: codeInput },
{ title: "Horizontal", demo: demoHorizontal, code: codeHorizontal },
{ title: "Responsive", demo: demoResponsive, code: codeResponsive },
{
title: "Choice card",
demo: demoChoiceCard,
code: codeChoiceCard,
description: "A Field.Label can wrap a Field.Field to create a selectable card.",
},
{
title: "Errors",
demo: demoErrors,
code: `${codeErrors}\n\n${codeMultipleErrors}`,
},
]}
/>

## Props

<PropsTable {props} />

## Theming

Field reads `--background`, `--border`, `--destructive`, `--input`, `--muted-foreground`,
`--primary`, `--text-sm`, `--text-sm--line-height`, `--text-base`,
`--text-base--line-height`, `--leading-snug` and `--leading-normal`.
