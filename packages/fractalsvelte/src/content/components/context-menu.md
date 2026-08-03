<script lang="ts">
	import * as ContextMenu from '$lib/components/context-menu/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let bookmarks = $state(false);
	let fullUrls = $state(true);
	let person = $state('pedro');
	let position = $state('bottom');

	const rootProps: PropRow[] = [
		{ name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state.' },
		{ name: 'dir', type: '"ltr" | "rtl"', default: '"ltr"', description: 'Reading direction.' },
		{ name: 'children', type: 'Snippet', description: 'Trigger and content.' }
	];

	const contentProps: PropRow[] = [
		{
			name: 'portalProps',
			type: 'ContextMenu.PortalProps',
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

	const codeInstall = `npm i fractalsvelte bits-ui`;
	const usage = `<script lang="ts">
  import * as ContextMenu from "fractalsvelte/context-menu";
<\/script>

<ContextMenu.Root>
  <ContextMenu.Trigger>Right click here</ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item>Reload</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>`;

	const codeBasic = `<ContextMenu.Item inset>Back <ContextMenu.Shortcut>⌘[</ContextMenu.Shortcut></ContextMenu.Item>
<ContextMenu.Item inset disabled>Forward</ContextMenu.Item>
<ContextMenu.Sub>...</ContextMenu.Sub>`;
	const codeCheckboxes = `<ContextMenu.CheckboxItem bind:checked={bookmarks}>Show Bookmarks</ContextMenu.CheckboxItem>`;
	const codeRadio = `<ContextMenu.RadioGroup bind:value={person}>
  <ContextMenu.RadioItem value="pedro">Pedro Duarte</ContextMenu.RadioItem>
</ContextMenu.RadioGroup>`;
	const codeDestructive = `<ContextMenu.Item variant="destructive">Delete</ContextMenu.Item>`;
</script>

<h1 class="doc-title">Context Menu</h1>
<p class="doc-lede">A menu opened from a secondary pointer action.</p>

<Preview description="Context Menu — browser actions" code={usage}>
	<ContextMenu.Root>
		<ContextMenu.Trigger
			style="display:flex; width:19rem; height:9rem; align-items:center; justify-content:center; border:1px dashed var(--border); border-radius:var(--radius); font-size:var(--text-sm)"
		>
			Right click here
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item inset>
				Back
				<ContextMenu.Shortcut>⌘[</ContextMenu.Shortcut>
			</ContextMenu.Item>
			<ContextMenu.Item inset disabled>
				Forward
				<ContextMenu.Shortcut>⌘]</ContextMenu.Shortcut>
			</ContextMenu.Item>
			<ContextMenu.Item inset>
				Reload
				<ContextMenu.Shortcut>⌘R</ContextMenu.Shortcut>
			</ContextMenu.Item>
			<ContextMenu.Separator />
			<ContextMenu.CheckboxItem bind:checked={bookmarks}>Show Bookmarks</ContextMenu.CheckboxItem>
			<ContextMenu.CheckboxItem bind:checked={fullUrls}>Show Full URLs</ContextMenu.CheckboxItem>
		</ContextMenu.Content>
	</ContextMenu.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/context-menu/` into your project. It depends on `bits-ui`, and it
expects `styles/_tokens.sass` and `_typography.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet menuFrame()}
<ContextMenu.Trigger
style="display:flex; width:19rem; height:8rem; align-items:center; justify-content:center; border:1px dashed var(--border); border-radius:var(--radius); font-size:var(--text-sm)" >
Right click here
</ContextMenu.Trigger>
{/snippet}

{#snippet demoBasic()}
<ContextMenu.Root>
{@render menuFrame()}
<ContextMenu.Content>
<ContextMenu.Item inset>
Back
<ContextMenu.Shortcut>⌘[</ContextMenu.Shortcut>
</ContextMenu.Item>
<ContextMenu.Item inset disabled>
Forward
<ContextMenu.Shortcut>⌘]</ContextMenu.Shortcut>
</ContextMenu.Item>
<ContextMenu.Item inset>
Reload
<ContextMenu.Shortcut>⌘R</ContextMenu.Shortcut>
</ContextMenu.Item>
<ContextMenu.Sub>
<ContextMenu.SubTrigger inset>More Tools</ContextMenu.SubTrigger>
<ContextMenu.SubContent>
<ContextMenu.Item>Save Page As...</ContextMenu.Item>
<ContextMenu.Item>Create Shortcut...</ContextMenu.Item>
<ContextMenu.Separator />
<ContextMenu.Item>Developer Tools</ContextMenu.Item>
</ContextMenu.SubContent>
</ContextMenu.Sub>
</ContextMenu.Content>
</ContextMenu.Root>
{/snippet}

{#snippet demoCheckboxes()}
<ContextMenu.Root>
{@render menuFrame()}
<ContextMenu.Content>
<ContextMenu.Label>Appearance</ContextMenu.Label>
<ContextMenu.CheckboxItem bind:checked={bookmarks}>Show Bookmarks</ContextMenu.CheckboxItem>
<ContextMenu.CheckboxItem bind:checked={fullUrls}>Show Full URLs</ContextMenu.CheckboxItem>
</ContextMenu.Content>
</ContextMenu.Root>
{/snippet}

{#snippet demoRadio()}
<ContextMenu.Root>
{@render menuFrame()}
<ContextMenu.Content>
<ContextMenu.RadioGroup bind:value={person}>
<ContextMenu.Group>
<ContextMenu.GroupHeading inset>People</ContextMenu.GroupHeading>
<ContextMenu.RadioItem value="pedro">Pedro Duarte</ContextMenu.RadioItem>
<ContextMenu.RadioItem value="colm">Colm Tuite</ContextMenu.RadioItem>
</ContextMenu.Group>
</ContextMenu.RadioGroup>
</ContextMenu.Content>
</ContextMenu.Root>
{/snippet}

{#snippet demoDestructive()}
<ContextMenu.Root>
{@render menuFrame()}
<ContextMenu.Content>
<ContextMenu.Item>Duplicate</ContextMenu.Item>
<ContextMenu.Item>Archive</ContextMenu.Item>
<ContextMenu.Separator />
<ContextMenu.Item variant="destructive">Delete</ContextMenu.Item>
</ContextMenu.Content>
</ContextMenu.Root>
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

### ContextMenu.Root

<PropsTable props={rootProps} />

### ContextMenu.Content

<PropsTable props={contentProps} />

### ContextMenu.Item and ContextMenu.SubTrigger

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
