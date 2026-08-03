<script lang="ts">
	import { Button } from "$lib/components/button/index.js";
	import * as Card from "$lib/components/card/index.js";
	import { Input } from "$lib/components/input/index.js";
	import { Label } from "$lib/components/label/index.js";
	import * as Tabs from "$lib/components/tabs/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let accountTab = $state("account");
	let basicTab = $state("home");
	let lineTab = $state("overview");
	let contentTab = $state("account");
	let verticalTab = $state("account");

	const rootProps: PropRow[] = [
		{
			name: "value",
			type: "string",
			default: '""',
			description: "Bindable selected tab value.",
		},
		{
			name: "orientation",
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description: "Layout and keyboard orientation.",
		},
		{
			name: "activationMode",
			type: '"automatic" | "manual"',
			default: '"automatic"',
			description: "Whether focusing a trigger activates it automatically or waits for selection.",
		},
		{
			name: "loop",
			type: "boolean",
			default: "true",
			description: "Loops keyboard navigation at the first and last triggers.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Disables the entire tab set.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Tabs.List and Tabs.Content children.",
		},
		{
			name: "child",
			type: "Snippet",
			description: "Renders a custom root element with the behavior and data-slot props applied.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the root element.",
		},
	];

	const listProps: PropRow[] = [
		{
			name: "variant",
			type: '"default" | "line"',
			default: '"default"',
			description: "List treatment. Rendered as data-variant.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Tabs.Trigger children.",
		},
		{
			name: "child",
			type: "Snippet",
			description: "Renders a custom list element with the behavior and data-slot props applied.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the list element.",
		},
	];

	const triggerProps: PropRow[] = [
		{
			name: "value",
			type: "string",
			description: "Value this trigger selects.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Prevents this trigger from being selected.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Trigger label or icon content.",
		},
		{
			name: "child",
			type: "Snippet",
			description: "Renders a custom trigger element with the behavior and data-slot props applied.",
		},
		{
			name: "ref",
			type: "HTMLButtonElement | null",
			default: "null",
			description: "Bindable reference to the trigger button.",
		},
	];

	const contentProps: PropRow[] = [
		{
			name: "value",
			type: "string",
			description: "Panel value matched against Root.value.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Panel content.",
		},
		{
			name: "child",
			type: "Snippet",
			description: "Renders a custom panel element with the behavior and data-slot props applied.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the content panel.",
		},
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as Tabs from "fractalsvelte/tabs";
<\/script>

<Tabs.Root value="account">
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">Manage your account.</Tabs.Content>
  <Tabs.Content value="password">Change your password.</Tabs.Content>
</Tabs.Root>`;

	const codeBasic = `<Tabs.Root value="home">
  <Tabs.List>
    <Tabs.Trigger value="home">Home</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>`;

	const codeLine = `<Tabs.Root value="overview">
  <Tabs.List variant="line">
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
    <Tabs.Trigger value="reports">Reports</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>`;

	const codeDisabled = `<Tabs.Root value="home">
  <Tabs.List>
    <Tabs.Trigger value="home">Home</Tabs.Trigger>
    <Tabs.Trigger value="settings" disabled>Disabled</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>`;

	const codeIcons = `<Tabs.Root value="preview">
  <Tabs.List>
    <Tabs.Trigger value="preview">
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" /></svg>
      Preview
    </Tabs.Trigger>
    <Tabs.Trigger value="code">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 9-4 3 4 3M16 9l4 3-4 3" /></svg>
      Code
    </Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>`;

	const codeContent = `<Tabs.Root value="account">
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
    <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">Manage your account preferences.</Tabs.Content>
  <Tabs.Content value="password">Update your password.</Tabs.Content>
  <Tabs.Content value="notifications">Configure notifications.</Tabs.Content>
</Tabs.Root>`;

	const codeVertical = `<Tabs.Root value="account" orientation="vertical">
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
    <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">Manage your account preferences.</Tabs.Content>
</Tabs.Root>`;

	const codeForm = `<Tabs.Root value="account">
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">
    <Label for="tabs-name">Name</Label>
    <Input id="tabs-name" value="Pedro Duarte" />
    <Button>Save changes</Button>
  </Tabs.Content>
</Tabs.Root>`;
</script>

<h1 class="doc-title">Tabs</h1>
<p class="doc-lede">Layered sections of content where one panel is shown at a time.</p>

<Preview description="Tabs - account settings" code={usage}>
	<Tabs.Root bind:value={accountTab}>
		<Tabs.List>
			<Tabs.Trigger value="account">Account</Tabs.Trigger>
			<Tabs.Trigger value="password">Password</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="account">
			<Card.Root>
				<Card.Header>
					<Card.Title>Account</Card.Title>
					<Card.Description>Make changes to your account settings.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="box" style="gap:0.75rem">
						<Label for="tabs-preview-name">Name</Label>
						<Input id="tabs-preview-name" value="Pedro Duarte" />
					</div>
				</Card.Content>
				<Card.Footer>
					<Button>Save changes</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="password">
			<Card.Root>
				<Card.Header>
					<Card.Title>Password</Card.Title>
					<Card.Description>Change your password here.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="box" style="gap:0.75rem">
						<Label for="tabs-preview-password">New password</Label>
						<Input id="tabs-preview-password" type="password" />
					</div>
				</Card.Content>
				<Card.Footer>
					<Button>Save password</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/tabs/` into your project. It depends on `bits-ui`, and it expects
`styles/_mixins.sass`, `_tokens.sass` and `_typography.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoBasic()}
<Tabs.Root bind:value={basicTab}>
<Tabs.List>
<Tabs.Trigger value="home">Home</Tabs.Trigger>
<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
</Tabs.List>
</Tabs.Root>
{/snippet}

{#snippet demoLine()}
<Tabs.Root bind:value={lineTab}>
<Tabs.List variant="line">
<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
<Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
<Tabs.Trigger value="reports">Reports</Tabs.Trigger>
</Tabs.List>
</Tabs.Root>
{/snippet}

{#snippet demoDisabled()}
<Tabs.Root value="home">
<Tabs.List>
<Tabs.Trigger value="home">Home</Tabs.Trigger>
<Tabs.Trigger value="settings" disabled>Disabled</Tabs.Trigger>
</Tabs.List>
</Tabs.Root>
{/snippet}

{#snippet demoIcons()}
<Tabs.Root value="preview">
<Tabs.List>
<Tabs.Trigger value="preview">
<svg viewBox="0 0 24 24" aria-hidden="true">
<rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
</svg>
Preview
</Tabs.Trigger>
<Tabs.Trigger value="code">
<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
<path d="m8 9-4 3 4 3M16 9l4 3-4 3" />
</svg>
Code
</Tabs.Trigger>
</Tabs.List>
</Tabs.Root>
{/snippet}

{#snippet demoContent()}
<Tabs.Root bind:value={contentTab}>
<Tabs.List>
<Tabs.Trigger value="account">Account</Tabs.Trigger>
<Tabs.Trigger value="password">Password</Tabs.Trigger>
<Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
</Tabs.List>

<div style="border:1px solid var(--border); border-radius:var(--radius); padding:1rem">
<Tabs.Content value="account">Manage your account preferences and profile information.</Tabs.Content>
<Tabs.Content value="password">Update your password to keep your account secure.</Tabs.Content>
<Tabs.Content value="notifications">Configure how you receive notifications and alerts.</Tabs.Content>
</div>
</Tabs.Root>
{/snippet}

{#snippet demoVertical()}
<Tabs.Root bind:value={verticalTab} orientation="vertical" class="row" style="gap:1rem; align-items:flex-start">
<Tabs.List>
<Tabs.Trigger value="account">Account</Tabs.Trigger>
<Tabs.Trigger value="password">Password</Tabs.Trigger>
<Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
</Tabs.List>

<div style="border:1px solid var(--border); border-radius:var(--radius); padding:1rem; max-width:24rem">
<Tabs.Content value="account">Manage your account preferences and profile information.</Tabs.Content>
<Tabs.Content value="password">Update your password with a strong mix of letters, numbers and symbols.</Tabs.Content>
<Tabs.Content value="notifications">Choose which notifications you receive and where they appear.</Tabs.Content>
</div>
</Tabs.Root>
{/snippet}

{#snippet demoForm()}
<Tabs.Root value="account">
<Tabs.List>
<Tabs.Trigger value="account">Account</Tabs.Trigger>
<Tabs.Trigger value="password">Password</Tabs.Trigger>
</Tabs.List>
<Tabs.Content value="account">
<Card.Root>
<Card.Header>
<Card.Title>Account</Card.Title>
<Card.Description>Update the public profile for this account.</Card.Description>
</Card.Header>
<Card.Content>

<div class="box" style="gap:0.75rem">
<Label for="tabs-form-name">Name</Label>
<Input id="tabs-form-name" value="Pedro Duarte" />
<Label for="tabs-form-username">Username</Label>
<Input id="tabs-form-username" value="@peduarte" />
</div>
</Card.Content>
<Card.Footer>
<Button>Save changes</Button>
</Card.Footer>
</Card.Root>
</Tabs.Content>
<Tabs.Content value="password">
<Card.Root>
<Card.Header>
<Card.Title>Password</Card.Title>
<Card.Description>Change your password.</Card.Description>
</Card.Header>
<Card.Content>
<div class="box" style="gap:0.75rem">
<Label for="tabs-form-current">Current password</Label>
<Input id="tabs-form-current" type="password" />
<Label for="tabs-form-new">New password</Label>
<Input id="tabs-form-new" type="password" />
</div>
</Card.Content>
<Card.Footer>
<Button>Save password</Button>
</Card.Footer>
</Card.Root>
</Tabs.Content>
</Tabs.Root>
{/snippet}

<Examples
items={[
{ title: "Basic", demo: demoBasic, code: codeBasic },
{ title: "Line", demo: demoLine, code: codeLine },
{ title: "Disabled", demo: demoDisabled, code: codeDisabled },
{ title: "Icons", demo: demoIcons, code: codeIcons },
{ title: "Content", demo: demoContent, code: codeContent },
{ title: "Vertical", demo: demoVertical, code: codeVertical },
{ title: "Form", demo: demoForm, code: codeForm },
]}
/>

## Props

<PropsTable title="Root" props={rootProps} />
<PropsTable title="List" props={listProps} />
<PropsTable title="Trigger" props={triggerProps} />
<PropsTable title="Content" props={contentProps} />

## Theming

Tabs reads these tokens:

- `--muted`, `--muted-foreground`
- `--background`, `--foreground`
- `--border`, `--input`, `--ring`
- `--radius`
- `--text-sm`, `--text-sm--line-height`
