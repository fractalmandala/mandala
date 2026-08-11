<script lang="ts">
	import * as DropdownMenu from '$lib/components/dropdown-menu/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let statusBar = $state(true);
	let activityBar = $state(false);
	let panel = $state(false);
	let position = $state('bottom');

	const rootProps: PropRow[] = [
		{ name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state.' },
		{ name: 'dir', type: '"ltr" | "rtl"', default: '"ltr"', description: 'Reading direction.' },
		{ name: 'children', type: 'Snippet', description: 'Trigger and content.' }
	];

	const contentProps: PropRow[] = [
		{ name: 'align', type: '"start" | "center" | "end"', default: '"start"', description: 'Content alignment.' },
		{ name: 'sideOffset', type: 'number', default: '4', description: 'Distance from trigger.' },
		{
			name: 'portalProps',
			type: 'DropdownMenu.PortalProps',
			description: 'Props passed to the portal wrapper.'
		},
		{ name: 'loop', type: 'boolean', default: 'false', description: 'Loops keyboard navigation.' },
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the floating content.'
		}
	];

	const itemProps: PropRow[] = [
		{ name: 'inset', type: 'boolean', default: 'false', description: 'Adds leading padding.' },
		{
			name: 'variant',
			type: '"default" | "destructive"',
			default: '"default"',
			description: 'Item tone. Rendered as data-variant.'
		},
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables selection.' },
		{ name: 'onSelect', type: '(event: Event) => void', description: 'Called when selected.' },
		{ name: 'children', type: 'Snippet', description: 'Item content.' }
	];

	const choiceProps: PropRow[] = [
		{ name: 'checked', type: 'boolean', default: 'false', description: 'Checkbox item checked state.' },
		{
			name: 'indeterminate',
			type: 'boolean',
			default: 'false',
			description: 'Checkbox item mixed state.'
		},
		{ name: 'value', type: 'string', description: 'Radio item value, or checkbox group value.' },
		{ name: 'inset', type: 'boolean', default: 'false', description: 'Adds leading padding.' }
	];

	const codeInstall = `npm i fractalsvelte`;
	const usage = `<script lang="ts">
  import * as DropdownMenu from "fractalsvelte/dropdown-menu";
<\/script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>Profile</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>`;

	const codeBasic = `<DropdownMenu.Label>My Account</DropdownMenu.Label>
<DropdownMenu.Item>Profile <DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut></DropdownMenu.Item>`;
	const codeCheckboxes = `<DropdownMenu.CheckboxItem bind:checked={statusBar}>Status Bar</DropdownMenu.CheckboxItem>`;
	const codeRadio = `<DropdownMenu.RadioGroup bind:value={position}>
  <DropdownMenu.RadioItem value="bottom">Bottom</DropdownMenu.RadioItem>
</DropdownMenu.RadioGroup>`;
	const codeDestructive = `<DropdownMenu.Item variant="destructive">Delete project</DropdownMenu.Item>`;
</script>

<h1 class="doc-title">Dropdown Menu</h1>
<p class="doc-lede">A menu of actions or choices opened from a button.</p>

<Preview description="Dropdown Menu — account actions" code={usage}>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Label>My Account</DropdownMenu.Label>
			<DropdownMenu.Group>
				<DropdownMenu.Item>
					Profile
					<DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					Billing
					<DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					Settings
					<DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Item disabled>API</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/dropdown-menu/` into your project. It expects `styles/_tokens.sass` and `_typography.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet trigger()}
<DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
{/snippet}

{#snippet demoBasic()}
<DropdownMenu.Root>
{@render trigger()}
<DropdownMenu.Content>
<DropdownMenu.Label>My Account</DropdownMenu.Label>
<DropdownMenu.Item>
Profile
<DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
</DropdownMenu.Item>
<DropdownMenu.Item>
Billing
<DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
</DropdownMenu.Item>
<DropdownMenu.Sub>
<DropdownMenu.SubTrigger>Invite users</DropdownMenu.SubTrigger>
<DropdownMenu.SubContent>
<DropdownMenu.Item>Email</DropdownMenu.Item>
<DropdownMenu.Item>Message</DropdownMenu.Item>
</DropdownMenu.SubContent>
</DropdownMenu.Sub>
<DropdownMenu.Separator />
<DropdownMenu.Item disabled>API</DropdownMenu.Item>
</DropdownMenu.Content>
</DropdownMenu.Root>
{/snippet}

{#snippet demoCheckboxes()}
<DropdownMenu.Root>
{@render trigger()}
<DropdownMenu.Content>
<DropdownMenu.Label>Appearance</DropdownMenu.Label>
<DropdownMenu.Separator />
<DropdownMenu.CheckboxItem bind:checked={statusBar}>Status Bar</DropdownMenu.CheckboxItem>
<DropdownMenu.CheckboxItem bind:checked={activityBar} disabled>Activity Bar</DropdownMenu.CheckboxItem>
<DropdownMenu.CheckboxItem bind:checked={panel}>Panel</DropdownMenu.CheckboxItem>
</DropdownMenu.Content>
</DropdownMenu.Root>
{/snippet}

{#snippet demoRadio()}
<DropdownMenu.Root>
{@render trigger()}
<DropdownMenu.Content>
<DropdownMenu.Label>Panel Position</DropdownMenu.Label>
<DropdownMenu.Separator />
<DropdownMenu.RadioGroup bind:value={position}>
<DropdownMenu.RadioItem value="top">Top</DropdownMenu.RadioItem>
<DropdownMenu.RadioItem value="bottom">Bottom</DropdownMenu.RadioItem>
<DropdownMenu.RadioItem value="right">Right</DropdownMenu.RadioItem>
</DropdownMenu.RadioGroup>
</DropdownMenu.Content>
</DropdownMenu.Root>
{/snippet}

{#snippet demoDestructive()}
<DropdownMenu.Root>
{@render trigger()}
<DropdownMenu.Content>
<DropdownMenu.Item>Duplicate</DropdownMenu.Item>
<DropdownMenu.Item>Archive</DropdownMenu.Item>
<DropdownMenu.Separator />
<DropdownMenu.Item variant="destructive">Delete project</DropdownMenu.Item>
</DropdownMenu.Content>
</DropdownMenu.Root>
{/snippet}

<Examples
items={[
{ title: 'Basic', demo: demoBasic, code: codeBasic },
{ title: 'Checkboxes', demo: demoCheckboxes, code: codeCheckboxes },
{ title: 'Radio', demo: demoRadio, code: codeRadio },
{ title: 'Destructive', demo: demoDestructive, code: codeDestructive }
]}
/>

## Props

### DropdownMenu.Root

<PropsTable props={rootProps} />

### DropdownMenu.Content

<PropsTable props={contentProps} />

### DropdownMenu.Item and DropdownMenu.SubTrigger

<PropsTable props={itemProps} />

### Checkbox and Radio Items

<PropsTable props={choiceProps} />

## Theming

<div class="doc-table-wrap">

| Token                                | Used for                             |
| ------------------------------------ | ------------------------------------ |
| `--popover` / `--popover-foreground` | Floating menu surface                |
| `--foreground`                       | Surface ring, translucent highlights |
| `--accent` / `--accent-foreground`   | Focused item text treatment          |
| `--muted-foreground`                 | Labels and shortcuts                 |
| `--border`                           | Separators                           |
| `--destructive`                      | Destructive items                    |

</div>
