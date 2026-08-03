<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { Input } from "$lib/components/input/index.js";
	import * as Form from "$lib/components/form/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	type DemoForm = {
		username: string;
	};

	const demoForm = superForm<DemoForm>(
		{ username: "" },
		{
			SPA: true,
			validators: false,
			onUpdate: ({ form }) => {
				submitted = form.valid ? JSON.stringify(form.data, null, 2) : "";
			},
		}
	);

	const settingsForm = superForm(
		{ email: "" },
		{
			SPA: true,
			validators: false,
		}
	);

	const form = demoForm;
	const { form: formData, enhance } = demoForm;
	const { form: settingsData, enhance: enhanceSettings } = settingsForm;

	let submitted = $state("");

	const props: PropRow[] = [
		{
			name: "Field",
			type: "Component",
			description:
				"Registers a form path and renders a data-slot='form-item' wrapper around its children.",
		},
		{
			name: "ElementField",
			type: "Component",
			description: "Registers a leaf form path for element-level field composition.",
		},
		{
			name: "Control",
			type: "Component",
			description:
				"Provides form control props such as id, name, aria-invalid, aria-describedby and data-fs-control.",
		},
		{
			name: "Label",
			type: "Component",
			description:
				"Renders a label connected to the current control. Error state is exposed through data-fs-error.",
		},
		{
			name: "Description",
			type: "Component",
			description: "Renders helper text connected through aria-describedby.",
		},
		{
			name: "FieldErrors",
			type: "Component",
			description:
				"Renders validation messages, or a custom children snippet with errors and errorProps.",
		},
		{
			name: "Fieldset",
			type: "Component",
			description: "Groups related controls for a form path and renders a fieldset.",
		},
		{
			name: "Legend",
			type: "Component",
			description: "Labels a fieldset and follows the field error state.",
		},
		{
			name: "Button",
			type: "Component",
			description: "A submit Button wrapper. Defaults type to submit.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference exposed by the styled Form parts.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Rendered content. Field snippets receive constraints, errors, tainted and value.",
		},
	];

	const codeInstall = `npm i fractalsvelte formsnap sveltekit-superforms`;

	const usage = `<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import * as Form from "fractalsvelte/form";
  import { Input } from "fractalsvelte/input";

  const form = superForm({ username: "" }, { SPA: true });
  const { form: formData, enhance } = form;
<\/script>

<form method="POST" use:enhance>
  <Form.Field {form} name="username">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Username</Form.Label>
        <Input {...props} bind:value={$formData.username} />
      {/snippet}
    </Form.Control>
    <Form.Description>This is your public display name.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button>Submit</Form.Button>
</form>`;

	const codeBasic = `<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import * as Form from "fractalsvelte/form";
  import { Input } from "fractalsvelte/input";

  const form = superForm({ username: "" }, { SPA: true });
  const { form: formData, enhance } = form;
<\/script>

<form method="POST" use:enhance>
  <Form.Field {form} name="username">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Username</Form.Label>
        <Input {...props} bind:value={$formData.username} />
      {/snippet}
    </Form.Control>
    <Form.Description>This is your public display name.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button>Submit</Form.Button>
</form>`;

	const codeFieldset = `<Form.Fieldset {form} name="email">
  <Form.Legend>Email notifications</Form.Legend>
  <Form.Description>Choose the address used for account updates.</Form.Description>
  <Form.Control>
    {#snippet children({ props })}
      <Input type="email" {...props} bind:value={$formData.email} />
    {/snippet}
  </Form.Control>
  <Form.FieldErrors />
</Form.Fieldset>`;
</script>

<h1 class="doc-title">Form</h1>
<p class="doc-lede">Accessible form composition for labels, descriptions, controls and validation messages.</p>

<Preview description="Form — username field" code={codeBasic}>
	<form method="POST" class="box" style="gap:1.5rem; width:min(24rem, 100%)" use:enhance>
		<Form.Field {form} name="username">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Username</Form.Label>
					<Input
						{...props}
						required
						minlength={2}
						placeholder="amrit"
						bind:value={$formData.username}
					/>
				{/snippet}
			</Form.Control>
			<Form.Description>This is your public display name.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button>Submit</Form.Button>
		{#if submitted}
			<pre>{submitted}</pre>
		{/if}
	</form>
</Preview>

## Installation

Install the package and peer behavior libraries:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/form/` into your project. It depends on `formsnap`,
`sveltekit-superforms`, the local `button` and `label` components, and the shared style tokens.

## Usage

<CodeBlock code={usage} lang="svelte" />

## Examples

{#snippet demoBasic()}

<form method="POST" class="box" style="gap:1.5rem; width:min(24rem, 100%)" use:enhance>
<Form.Field {form} name="username">
<Form.Control>
{#snippet children({ props })}
<Form.Label>Username</Form.Label>
<Input
{...props}
required
minlength={2}
placeholder="amrit"
bind:value={$formData.username}
/>
{/snippet}
</Form.Control>
<Form.Description>This is your public display name.</Form.Description>
<Form.FieldErrors />
</Form.Field>
<Form.Button>Submit</Form.Button>
</form>
{/snippet}

{#snippet demoFieldset()}

<form method="POST" class="box" style="gap:1.5rem; width:min(24rem, 100%)" use:enhanceSettings>
<Form.Fieldset form={settingsForm} name="email">
<Form.Legend>Email notifications</Form.Legend>
<Form.Description>Choose the address used for account updates.</Form.Description>
<Form.Control>
{#snippet children({ props })}
<Input
type="email"
{...props}
placeholder="you@example.com"
bind:value={$settingsData.email}
/>
{/snippet}
</Form.Control>
<Form.FieldErrors />
</Form.Fieldset>
<Form.Button>Save</Form.Button>
</form>
{/snippet}

<Examples
items={[
{ title: "Basic", demo: demoBasic, code: codeBasic },
{ title: "Fieldset", demo: demoFieldset, code: codeFieldset },
]}
/>

## Props

<PropsTable {props} />

## Theming

Form reads `--muted-foreground`, `--destructive`, `--primary`, `--text-sm` and
`--text-sm--line-height`.
