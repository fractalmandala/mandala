<script lang="ts">
	import * as Menubar from '$lib/components/menubar/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let bookmarks = $state(false);
	let fullUrls = $state(true);
	let profile = $state('benoit');
	let theme = $state('system');

	const rootProps: PropRow[] = [
		{
			name: 'value',
			type: 'string',
			description: 'Bindable value for the currently active menu.'
		},
		{ name: 'dir', type: '"ltr" | "rtl"', default: '"ltr"', description: 'Reading direction.' },
		{ name: 'loop', type: 'boolean', default: 'true', description: 'Loops keyboard navigation.' },
		{ name: 'children', type: 'Snippet', description: 'Menu groups and triggers.' }
	];

	const contentProps: PropRow[] = [
		{ name: 'align', type: '"start" | "center" | "end"', default: '"start"', description: 'Content alignment.' },
		{ name: 'side', type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: 'Preferred side.' },
		{ name: 'sideOffset', type: 'number', default: '8', description: 'Distance from trigger.' },
		{ name: 'alignOffset', type: 'number', default: '-4', description: 'Cross-axis offset.' },
		{ name: 'width', type: 'string', description: 'Explicit content width, such as "10rem" or "16rem".' },
		{
			name: 'portalProps',
			type: 'Menubar.PortalProps',
			description: 'Props passed to the portal wrapper.'
		},
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
		{ name: 'value', type: 'string', description: 'Radio item value.' },
		{ name: 'inset', type: 'boolean', default: 'false', description: 'Adds leading padding.' },
		{ name: 'children', type: 'Snippet', description: 'Item label, with checked state passed to radio snippets.' }
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;
	const usage = `<script lang="ts">
  import * as Menubar from "fractalsvelte/menubar";
<\/script>

<Menubar.Root>
  <Menubar.Menu>
    <Menubar.Trigger>File</Menubar.Trigger>
    <Menubar.Content>
      <Menubar.Item>
        New Tab
        <Menubar.Shortcut>⌘T</Menubar.Shortcut>
      </Menubar.Item>
    </Menubar.Content>
  </Menubar.Menu>
</Menubar.Root>`;

	const codeBasic = `<Menubar.Root>
  <Menubar.Menu>
    <Menubar.Trigger>File</Menubar.Trigger>
    <Menubar.Content>
      <Menubar.Item>New Tab <Menubar.Shortcut>⌘T</Menubar.Shortcut></Menubar.Item>
      <Menubar.Item disabled>New Incognito Window</Menubar.Item>
    </Menubar.Content>
  </Menubar.Menu>
</Menubar.Root>`;

	const codeSubmenu = `<Menubar.Sub>
  <Menubar.SubTrigger>Share</Menubar.SubTrigger>
  <Menubar.SubContent>
    <Menubar.Item>Email link</Menubar.Item>
  </Menubar.SubContent>
</Menubar.Sub>`;

	const codeChoices = `<Menubar.CheckboxItem bind:checked={bookmarks}>Show Bookmarks</Menubar.CheckboxItem>
<Menubar.RadioGroup bind:value={profile}>
  <Menubar.RadioItem value="benoit">Benoit</Menubar.RadioItem>
</Menubar.RadioGroup>`;

	const codeDestructive = `<Menubar.Item variant="destructive">
  Delete File <Menubar.Shortcut>⌘⌫</Menubar.Shortcut>
</Menubar.Item>`;
</script>

<h1 class="doc-title">Menubar</h1>
<p class="doc-lede">A persistent command menu for application-style navigation.</p>

<Preview description="Menubar - desktop commands" code={usage}>
	<Menubar.Root>
		<Menubar.Menu>
			<Menubar.Trigger>File</Menubar.Trigger>
			<Menubar.Content>
				<Menubar.Item>
					New Tab
					<Menubar.Shortcut>⌘T</Menubar.Shortcut>
				</Menubar.Item>
				<Menubar.Item>
					New Window
					<Menubar.Shortcut>⌘N</Menubar.Shortcut>
				</Menubar.Item>
				<Menubar.Separator />
				<Menubar.Sub>
					<Menubar.SubTrigger>Share</Menubar.SubTrigger>
					<Menubar.SubContent>
						<Menubar.Item>Email link</Menubar.Item>
						<Menubar.Item>Messages</Menubar.Item>
						<Menubar.Item>Notes</Menubar.Item>
					</Menubar.SubContent>
				</Menubar.Sub>
			</Menubar.Content>
		</Menubar.Menu>
		<Menubar.Menu>
			<Menubar.Trigger>View</Menubar.Trigger>
			<Menubar.Content width="16rem">
				<Menubar.CheckboxItem bind:checked={bookmarks}>Always Show Bookmarks Bar</Menubar.CheckboxItem>
				<Menubar.CheckboxItem bind:checked={fullUrls}>Always Show Full URLs</Menubar.CheckboxItem>
			</Menubar.Content>
		</Menubar.Menu>
		<Menubar.Menu>
			<Menubar.Trigger>Profiles</Menubar.Trigger>
			<Menubar.Content>
				<Menubar.RadioGroup bind:value={profile}>
					<Menubar.RadioItem value="andy">Andy</Menubar.RadioItem>
					<Menubar.RadioItem value="benoit">Benoit</Menubar.RadioItem>
					<Menubar.RadioItem value="luis">Luis</Menubar.RadioItem>
				</Menubar.RadioGroup>
			</Menubar.Content>
		</Menubar.Menu>
	</Menubar.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/menubar/` into your project. It depends on `bits-ui`, and it
expects `styles/_tokens.sass` and `_typography.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet menuBasic()}
<Menubar.Root>
<Menubar.Menu>
<Menubar.Trigger>File</Menubar.Trigger>
<Menubar.Content>
<Menubar.Item>
New Tab
<Menubar.Shortcut>⌘T</Menubar.Shortcut>
</Menubar.Item>
<Menubar.Item>
New Window
<Menubar.Shortcut>⌘N</Menubar.Shortcut>
</Menubar.Item>
<Menubar.Item disabled>New Incognito Window</Menubar.Item>
<Menubar.Separator />
<Menubar.Item>
Print
<Menubar.Shortcut>⌘P</Menubar.Shortcut>
</Menubar.Item>
</Menubar.Content>
</Menubar.Menu>
<Menubar.Menu>
<Menubar.Trigger>Edit</Menubar.Trigger>
<Menubar.Content>
<Menubar.Item>Undo <Menubar.Shortcut>⌘Z</Menubar.Shortcut></Menubar.Item>
<Menubar.Item>Redo <Menubar.Shortcut>⇧⌘Z</Menubar.Shortcut></Menubar.Item>
<Menubar.Separator />
<Menubar.Item>Cut</Menubar.Item>
<Menubar.Item>Copy</Menubar.Item>
<Menubar.Item>Paste</Menubar.Item>
</Menubar.Content>
</Menubar.Menu>
</Menubar.Root>
{/snippet}

{#snippet menuSubmenu()}
<Menubar.Root>
<Menubar.Menu>
<Menubar.Trigger>File</Menubar.Trigger>
<Menubar.Content>
<Menubar.Sub>
<Menubar.SubTrigger>Share</Menubar.SubTrigger>
<Menubar.SubContent>
<Menubar.Item>Email link</Menubar.Item>
<Menubar.Item>Messages</Menubar.Item>
<Menubar.Item>Notes</Menubar.Item>
</Menubar.SubContent>
</Menubar.Sub>
<Menubar.Separator />
<Menubar.Item>Print <Menubar.Shortcut>⌘P</Menubar.Shortcut></Menubar.Item>
</Menubar.Content>
</Menubar.Menu>
<Menubar.Menu>
<Menubar.Trigger>Edit</Menubar.Trigger>
<Menubar.Content>
<Menubar.Sub>
<Menubar.SubTrigger>Find</Menubar.SubTrigger>
<Menubar.SubContent>
<Menubar.Item>Find...</Menubar.Item>
<Menubar.Item>Find Next</Menubar.Item>
<Menubar.Item>Find Previous</Menubar.Item>
</Menubar.SubContent>
</Menubar.Sub>
</Menubar.Content>
</Menubar.Menu>
</Menubar.Root>
{/snippet}

{#snippet menuChoices()}
<Menubar.Root>
<Menubar.Menu>
<Menubar.Trigger>View</Menubar.Trigger>
<Menubar.Content width="16rem">
<Menubar.Label>Appearance</Menubar.Label>
<Menubar.CheckboxItem bind:checked={bookmarks}>Show Bookmarks</Menubar.CheckboxItem>
<Menubar.CheckboxItem bind:checked={fullUrls}>Show Full URLs</Menubar.CheckboxItem>
<Menubar.Separator />
<Menubar.Item inset>Reload <Menubar.Shortcut>⌘R</Menubar.Shortcut></Menubar.Item>
</Menubar.Content>
</Menubar.Menu>
<Menubar.Menu>
<Menubar.Trigger>Theme</Menubar.Trigger>
<Menubar.Content>
<Menubar.RadioGroup bind:value={theme}>
<Menubar.RadioItem value="light">Light</Menubar.RadioItem>
<Menubar.RadioItem value="dark">Dark</Menubar.RadioItem>
<Menubar.RadioItem value="system">System</Menubar.RadioItem>
</Menubar.RadioGroup>
</Menubar.Content>
</Menubar.Menu>
</Menubar.Root>
{/snippet}

{#snippet fileIcon()}
<svg data-icon="inline-start" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
<path d="M14 2v6h6" />
</svg>
{/snippet}

{#snippet trashIcon()}
<svg data-icon="inline-start" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M3 6h18" />
<path d="M8 6V4h8v2" />
<path d="m19 6-1 14H6L5 6" />
</svg>
{/snippet}

{#snippet menuDestructive()}
<Menubar.Root>
<Menubar.Menu>
<Menubar.Trigger>File</Menubar.Trigger>
<Menubar.Content width="10rem">
<Menubar.Item>
{@render fileIcon()}
New File
<Menubar.Shortcut>⌘N</Menubar.Shortcut>
</Menubar.Item>
<Menubar.Separator />
<Menubar.Item variant="destructive">
{@render trashIcon()}
Delete File
<Menubar.Shortcut>⌘⌫</Menubar.Shortcut>
</Menubar.Item>
</Menubar.Content>
</Menubar.Menu>
</Menubar.Root>
{/snippet}

<Examples
items={[
{ title: 'Basic', demo: menuBasic, code: codeBasic },
{ title: 'Submenu', demo: menuSubmenu, code: codeSubmenu },
{ title: 'Checkboxes and radio', demo: menuChoices, code: codeChoices },
{ title: 'Destructive', demo: menuDestructive, code: codeDestructive }
]}
/>

## Props

### Menubar.Root

<PropsTable props={rootProps} />

### Menubar.Content and Menubar.SubContent

<PropsTable props={contentProps} />

### Menubar.Item and Menubar.SubTrigger

<PropsTable props={itemProps} />

### Checkbox and Radio Items

<PropsTable props={choiceProps} />

## Theming

<div class="doc-table-wrap">

| Token                                | Used for                         |
| ------------------------------------ | -------------------------------- |
| `--foreground`                       | Text, root border, surface rings |
| `--popover` / `--popover-foreground` | Floating menu surface            |
| `--accent` / `--accent-foreground`   | Focused and open items           |
| `--muted` / `--muted-foreground`     | Active triggers and shortcuts    |
| `--border`                           | Root border and separators       |
| `--destructive`                      | Destructive items                |
| `--ring`                             | Trigger focus ring               |

</div>
