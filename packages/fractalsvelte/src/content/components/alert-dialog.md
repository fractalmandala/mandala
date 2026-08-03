<script lang="ts">
	import { Button } from '$lib/components/button/index.js';
	import * as AlertDialog from '$lib/components/alert-dialog/index.js';
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
			type: '"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"',
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
			name: 'size',
			type: '"default" | "sm"',
			default: '"default"',
			description: 'Controls max-width scale of the content modal dialog.'
		},
		{
			name: 'interactOutsideBehavior',
			type: '"close" | "ignore" | "defer-otherwise-close" | "defer-otherwise-ignore"',
			default: '"close"',
			description:
				'Outside click behavior. Defaults to "close" so clicking the overlay dismisses the dialog. Use "ignore" for a strict confirmation that requires Cancel or Action.'
		},
		{
			name: 'portalProps',
			type: 'AlertDialog.PortalProps',
			description: 'Props passed to the portal wrapper.'
		},
		{ name: 'children', type: 'Snippet', description: 'Alert dialog body content.' },
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the panel.'
		}
	];

	const actionProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"',
			default: '"default"',
			description: 'Action button tone. Rendered as data-variant.'
		},
		{
			name: 'size',
			type: '"default" | "sm" | "lg"',
			default: '"default"',
			description: 'Action button size. Rendered as data-size.'
		},
		{ name: 'child', type: 'Snippet', description: 'Render a custom action element.' },
		{ name: 'children', type: 'Snippet', description: 'Action button content.' },
		{
			name: 'ref',
			type: 'HTMLButtonElement | null',
			default: 'null',
			description: 'Bindable reference to the action button.'
		}
	];

	const cancelProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"',
			default: '"outline"',
			description: 'Cancel button tone. Rendered as data-variant.'
		},
		{
			name: 'size',
			type: '"default" | "sm" | "lg"',
			default: '"default"',
			description: 'Cancel button size. Rendered as data-size.'
		},
		{ name: 'child', type: 'Snippet', description: 'Render a custom cancel element.' },
		{ name: 'children', type: 'Snippet', description: 'Cancel button content.' },
		{
			name: 'ref',
			type: 'HTMLButtonElement | null',
			default: 'null',
			description: 'Bindable reference to the cancel button.'
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

	const codeInstall = `npm i fractalsvelte bits-ui`;
	const usage = `<script lang="ts">
  import * as AlertDialog from "fractalsvelte/alert-dialog";
<\/script>

<AlertDialog.Root>
  <AlertDialog.Trigger>Show Dialog</AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action>Continue</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>`;

	const codeDestructive = `<AlertDialog.Root>
  <AlertDialog.Trigger variant="destructive">Delete Account</AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete account?</AlertDialog.Title>
      <AlertDialog.Description>
        This will permanently delete your account and all associated data.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action variant="destructive">Delete</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>`;

	const codeSmall = `<AlertDialog.Root>
  <AlertDialog.Trigger>Compact Alert</AlertDialog.Trigger>
  <AlertDialog.Content size="sm">
    <AlertDialog.Header>
      <AlertDialog.Title>Save changes?</AlertDialog.Title>
      <AlertDialog.Description>
        Unsaved changes will be lost if you leave.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action>Save</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>`;
</script>

<h1 class="doc-title">Alert Dialog</h1>
<p class="doc-lede">A modal dialog that interrupts the user with important content and expects a response.</p>

<Preview description="Alert Dialog - basic demo" code={usage}>
	<AlertDialog.Root>
		<AlertDialog.Trigger>Show Dialog</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
				<AlertDialog.Description>
					This action cannot be undone. This will permanently delete your account and remove
					your data from our servers.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action>Continue</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/alert-dialog/` into your project. It depends on `bits-ui`, and it
expects `styles/_tokens.sass`, `_mixins.sass`, and `_typography.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoDefault()}
<AlertDialog.Root>
	<AlertDialog.Trigger>Show Dialog</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete your account and remove
				your data from our servers.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
{/snippet}

{#snippet demoDestructive()}
<AlertDialog.Root>
	<AlertDialog.Trigger variant="destructive">Delete Account</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete account?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete your account and all associated data.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action variant="destructive">Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
{/snippet}

{#snippet demoSmall()}
<AlertDialog.Root>
	<AlertDialog.Trigger>Compact Alert</AlertDialog.Trigger>
	<AlertDialog.Content size="sm">
		<AlertDialog.Header>
			<AlertDialog.Title>Save changes?</AlertDialog.Title>
			<AlertDialog.Description>
				Unsaved changes will be lost if you leave without saving.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Save</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
{/snippet}

<Examples
	items={[
		{ title: 'Default', demo: demoDefault, code: usage },
		{ title: 'Destructive', demo: demoDestructive, code: codeDestructive },
		{ title: 'Compact (sm)', demo: demoSmall, code: codeSmall }
	]}
/>

## Props

### AlertDialog.Root

<PropsTable props={rootProps} />

### AlertDialog.Trigger

<PropsTable props={triggerProps} />

### AlertDialog.Content

<PropsTable props={contentProps} />

### AlertDialog.Action

<PropsTable props={actionProps} />

### AlertDialog.Cancel

<PropsTable props={cancelProps} />

### AlertDialog.Header, AlertDialog.Footer, AlertDialog.Title, AlertDialog.Description and AlertDialog.Media

<PropsTable props={sectionProps} />

## Theming

<div class="doc-table-wrap">

| Token                                | Used for                             |
| ------------------------------------ | ------------------------------------ |
| `--popover` / `--popover-foreground` | Alert dialog panel surface and text  |
| `--foreground`                       | Overlay ring, title text             |
| `--muted-foreground`                 | Description text                     |
| `--primary` / `--primary-foreground` | Action default tone                  |
| `--destructive`                      | Destructive action tone              |
| `--border`                           | Outline trigger/cancel border        |
| `--background`                       | Outline trigger/cancel background    |
| `--muted`                            | Media background and hover state     |
| `--ring`                             | Focus rings                          |

</div>
