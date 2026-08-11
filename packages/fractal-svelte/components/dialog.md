<script lang="ts">
	import { Button } from '$lib/components/button/index.js';
	import * as Dialog from '$lib/components/dialog/index.js';
	import { Input } from '$lib/components/input/index.js';
	import { Label } from '$lib/components/label/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const rootProps: PropRow[] = [
		{ name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state.' },
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			description: 'Called when the open state changes.'
		},
		{ name: 'children', type: 'Snippet', description: 'Trigger and dialog content.' }
	];

	const triggerProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "outline" | "secondary" | "ghost"',
			default: '"outline"',
			description: 'Button-like trigger tone. Rendered as data-variant.'
		},
		{
			name: 'size',
			type: '"default" | "sm" | "lg"',
			default: '"default"',
			description: 'Button-like trigger size. Rendered as data-size.'
		},
		{ name: 'child', type: 'Snippet', description: 'Render a custom trigger element.' },
		{ name: 'children', type: 'Snippet', description: 'Trigger content.' },
		{
			name: 'ref',
			type: 'HTMLButtonElement | null',
			default: 'null',
			description: 'Bindable reference to the trigger.'
		}
	];

	const contentProps: PropRow[] = [
		{
			name: 'maxWidth',
			type: 'string',
			description: 'CSS max-width for the panel. Omit to use the theme md default.'
		},
		{
			name: 'minWidth',
			type: 'string',
			description: 'Optional CSS min-width for wider application dialogs.'
		},
		{
			name: 'showCloseButton',
			type: 'boolean',
			default: 'true',
			description: 'Renders the top-right close control.'
		},
		{
			name: 'closeIcon',
			type: 'Snippet',
			description: 'Custom icon for the top-right close control.'
		},
		{
			name: 'portalProps',
			type: 'Dialog.PortalProps',
			description: 'Props passed to the portal wrapper.'
		},
		{ name: 'children', type: 'Snippet', description: 'Dialog body content.' },
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the panel.'
		}
	];

	const closeProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "outline" | "secondary" | "ghost"',
			default: '"outline"',
			description: 'Button-like close tone. Rendered as data-variant.'
		},
		{
			name: 'size',
			type: '"default" | "sm" | "icon-sm"',
			default: '"default"',
			description: 'Button-like close size. Rendered as data-size.'
		},
		{
			name: 'position',
			type: '"inline" | "content"',
			default: '"inline"',
			description: 'Inline close controls live in content; content controls are positioned in the corner.'
		},
		{ name: 'child', type: 'Snippet', description: 'Render a custom close control.' },
		{ name: 'children', type: 'Snippet', description: 'Close control content.' },
		{
			name: 'ref',
			type: 'HTMLButtonElement | null',
			default: 'null',
			description: 'Bindable reference to the close control.'
		}
	];

	const sectionProps: PropRow[] = [
		{ name: 'children', type: 'Snippet', description: 'Section content.' },
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the element.'
		}
	];

	const footerProps: PropRow[] = [
		{
			name: 'align',
			type: '"end" | "start" | "between"',
			default: '"end"',
			description: 'Desktop footer alignment. Mobile stays column-reverse.'
		},
		{
			name: 'showCloseButton',
			type: 'boolean',
			default: 'false',
			description: 'Adds an outline Close button after custom actions.'
		},
		{ name: 'children', type: 'Snippet', description: 'Footer actions.' },
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the footer.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;
	const usage = `<script lang="ts">
  import * as Dialog from "fractalsvelte/dialog";
<\/script>

<Dialog.Root>
  <Dialog.Trigger>Open dialog</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Make changes to your profile.</Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>`;

	const codeForm = `<Dialog.Root>
  <form>
    <Dialog.Trigger>Edit profile</Dialog.Trigger>
    <Dialog.Content maxWidth="425px">
      <Dialog.Header>
        <Dialog.Title>Edit profile</Dialog.Title>
        <Dialog.Description>Make changes to your profile.</Dialog.Description>
      </Dialog.Header>
      <div class="box gap3">
        <Label for="name">Name</Label>
        <Input id="name" name="name" value="Pedro Duarte" />
      </div>
      <Dialog.Footer>
        <Dialog.Close>Cancel</Dialog.Close>
        <Button type="submit">Save changes</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </form>
</Dialog.Root>`;

	const codeShare = `<Dialog.Root>
  <Dialog.Trigger>Share</Dialog.Trigger>
  <Dialog.Content maxWidth="28rem">
    <Dialog.Header>
      <Dialog.Title>Share link</Dialog.Title>
      <Dialog.Description>Anyone with this link can view it.</Dialog.Description>
    </Dialog.Header>
    <Input value="https://example.com/docs/installation" />
    <Dialog.Footer align="start">
      <Dialog.Close variant="secondary">Close</Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>`;

	const codeNoClose = `<Dialog.Root>
  <Dialog.Trigger>No close button</Dialog.Trigger>
  <Dialog.Content showCloseButton={false}>
    <Dialog.Header>
      <Dialog.Title>No close button</Dialog.Title>
      <Dialog.Description>The corner close control is hidden.</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer showCloseButton />
  </Dialog.Content>
</Dialog.Root>`;
</script>

<h1 class="doc-title">Dialog</h1>
<p class="doc-lede">A modal window that renders content above an inert page.</p>

<Preview description="Dialog - profile form" code={usage}>
	<Dialog.Root>
		<form>
			<Dialog.Trigger>Edit profile</Dialog.Trigger>
			<Dialog.Content maxWidth="425px">
				<Dialog.Header>
					<Dialog.Title>Edit profile</Dialog.Title>
					<Dialog.Description>
						Make changes to your profile here. Click save when you're done.
					</Dialog.Description>
				</Dialog.Header>
				<div class="box gap3">
					<div class="box gap2">
						<Label for="dialog-preview-name">Name</Label>
						<Input id="dialog-preview-name" name="name" value="Pedro Duarte" />
					</div>
					<div class="box gap2">
						<Label for="dialog-preview-username">Username</Label>
						<Input id="dialog-preview-username" name="username" value="@peduarte" />
					</div>
				</div>
				<Dialog.Footer>
					<Dialog.Close>Cancel</Dialog.Close>
					<Button type="submit">Save changes</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</form>
	</Dialog.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/dialog/` into your project. It
expects `styles/_tokens.sass`, `_mixins.sass`, and `_typography.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoForm()}
<Dialog.Root>

<form>
<Dialog.Trigger>Edit profile</Dialog.Trigger>
<Dialog.Content maxWidth="425px">
<Dialog.Header>
<Dialog.Title>Edit profile</Dialog.Title>
<Dialog.Description>Make changes to your profile here. Click save when you're done.</Dialog.Description>
</Dialog.Header>
<div class="box gap3">
<div class="box gap2">
<Label for="dialog-demo-name">Name</Label>
<Input id="dialog-demo-name" name="name" value="Pedro Duarte" />
</div>
<div class="box gap2">
<Label for="dialog-demo-username">Username</Label>
<Input id="dialog-demo-username" name="username" value="@peduarte" />
</div>
</div>
<Dialog.Footer>
<Dialog.Close>Cancel</Dialog.Close>
<Button type="submit">Save changes</Button>
</Dialog.Footer>
</Dialog.Content>
</form>
</Dialog.Root>
{/snippet}

{#snippet demoShare()}
<Dialog.Root>
<Dialog.Trigger>Share</Dialog.Trigger>
<Dialog.Content maxWidth="28rem">
<Dialog.Header>
<Dialog.Title>Share link</Dialog.Title>
<Dialog.Description>Anyone who has this link will be able to view this.</Dialog.Description>
</Dialog.Header>

<div class="box gap2">
<Label for="dialog-share-link">Link</Label>
<Input id="dialog-share-link" value="https://example.com/docs/installation" />
</div>
<Dialog.Footer align="start">
<Dialog.Close variant="secondary">Close</Dialog.Close>
</Dialog.Footer>
</Dialog.Content>
</Dialog.Root>
{/snippet}

{#snippet demoNoClose()}
<Dialog.Root>
<Dialog.Trigger>No close button</Dialog.Trigger>
<Dialog.Content showCloseButton={false}>
<Dialog.Header>
<Dialog.Title>No close button</Dialog.Title>
<Dialog.Description>This dialog does not have a close button in the top-right corner.</Dialog.Description>
</Dialog.Header>
<Dialog.Footer showCloseButton />
</Dialog.Content>
</Dialog.Root>
{/snippet}

<Examples
items={[
{ title: 'Form', demo: demoForm, code: codeForm },
{ title: 'Custom close', demo: demoShare, code: codeShare },
{ title: 'No corner close', demo: demoNoClose, code: codeNoClose }
]}
/>

## Props

### Dialog.Root

<PropsTable props={rootProps} />

### Dialog.Trigger

<PropsTable props={triggerProps} />

### Dialog.Content

<PropsTable props={contentProps} />

### Dialog.Close

<PropsTable props={closeProps} />

### Dialog.Header, Dialog.Title and Dialog.Description

<PropsTable props={sectionProps} />

### Dialog.Footer

<PropsTable props={footerProps} />

## Theming

<div class="doc-table-wrap">

| Token                                | Used for                     |
| ------------------------------------ | ---------------------------- |
| `--popover` / `--popover-foreground` | Dialog panel surface         |
| `--foreground`                       | Overlay, panel ring, buttons |
| `--muted-foreground`                 | Description text             |
| `--primary` / `--primary-foreground` | Default trigger/close tone   |
| `--secondary`                        | Corner close background      |
| `--border`                           | Outline controls             |
| `--background`                       | Outline control background   |
| `--ring`                             | Focus rings                  |

</div>
