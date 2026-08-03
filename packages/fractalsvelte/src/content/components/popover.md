<script lang="ts">
	import { Input } from '$lib/components/input/index.js';
	import * as Popover from '$lib/components/popover/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let controlledOpen = $state(false);

	const rootProps: PropRow[] = [
		{ name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state.' },
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			description: 'Called when the open state changes.'
		},
		{ name: 'children', type: 'Snippet', description: 'Trigger and floating content.' }
	];

	const triggerProps: PropRow[] = [
		{ name: 'openOnHover', type: 'boolean', default: 'false', description: 'Open the popover on hover.' },
		{
			name: 'openDelay',
			type: 'number',
			default: '700',
			description: 'Delay before opening on hover, in milliseconds.'
		},
		{
			name: 'closeDelay',
			type: 'number',
			default: '300',
			description: 'Delay before closing after hover ends, in milliseconds.'
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
		{ name: 'align', type: '"start" | "center" | "end"', default: '"center"', description: 'Content alignment.' },
		{ name: 'side', type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: 'Preferred side.' },
		{ name: 'sideOffset', type: 'number', default: '4', description: 'Distance from the trigger.' },
		{
			name: 'width',
			type: 'string',
			description: 'CSS width for the floating panel. Omit to use the 18rem default.'
		},
		{
			name: 'portalProps',
			type: 'Popover.PortalProps',
			description: 'Props passed to the portal wrapper.'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the floating content.'
		}
	];

	const textProps: PropRow[] = [
		{ name: 'children', type: 'Snippet', description: 'Section content.' },
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the element.'
		}
	];

	const closeProps: PropRow[] = [
		{ name: 'child', type: 'Snippet', description: 'Render a custom close control.' },
		{ name: 'children', type: 'Snippet', description: 'Close control content.' },
		{
			name: 'ref',
			type: 'HTMLButtonElement | null',
			default: 'null',
			description: 'Bindable reference to the close control.'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;
	const usage = `<script lang="ts">
  import * as Popover from "fractalsvelte/popover";
<\/script>

<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Content>
    <Popover.Header>
      <Popover.Title>Dimensions</Popover.Title>
      <Popover.Description>Set the dimensions for the layer.</Popover.Description>
    </Popover.Header>
  </Popover.Content>
</Popover.Root>`;

	const codeDimensions = `<Popover.Root>
  <Popover.Trigger>Open popover</Popover.Trigger>
  <Popover.Content width="20rem">
    <Popover.Header>
      <Popover.Title>Dimensions</Popover.Title>
      <Popover.Description>Set the dimensions for the layer.</Popover.Description>
    </Popover.Header>
  </Popover.Content>
</Popover.Root>`;

	const codeAlignment = `<Popover.Root>
  <Popover.Trigger>Open aligned</Popover.Trigger>
  <Popover.Content align="start" side="right">
    <Popover.Title>Aligned panel</Popover.Title>
    <Popover.Description>Opens from the right edge.</Popover.Description>
  </Popover.Content>
</Popover.Root>`;

	const codeControlled = `<script lang="ts">
  let open = $state(false);
<\/script>

<Popover.Root bind:open>
  <Popover.Trigger>{open ? "Close" : "Open"} details</Popover.Trigger>
  <Popover.Content>
    <Popover.Title>Controlled popover</Popover.Title>
    <Popover.Description>The open state is bound.</Popover.Description>
    <Popover.Close>Done</Popover.Close>
  </Popover.Content>
</Popover.Root>`;
</script>

<h1 class="doc-title">Popover</h1>
<p class="doc-lede">Displays rich content in a floating portal anchored to a trigger.</p>

<Preview description="Popover — editable dimensions" code={usage}>
	<Popover.Root>
		<Popover.Trigger>Open popover</Popover.Trigger>
		<Popover.Content width="20rem">
			<Popover.Header>
				<Popover.Title>Dimensions</Popover.Title>
				<Popover.Description>Set the dimensions for the layer.</Popover.Description>
			</Popover.Header>
			<div class="box">
				<label for="popover-width">Width</label>
				<Input id="popover-width" value="100%" />
			</div>
			<div class="box">
				<label for="popover-max-width">Max. width</label>
				<Input id="popover-max-width" value="300px" />
			</div>
			<div class="box">
				<label for="popover-height">Height</label>
				<Input id="popover-height" value="25px" />
			</div>
		</Popover.Content>
	</Popover.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/popover/` into your project. It depends on `bits-ui`, and it
expects `styles/_tokens.sass` and `_typography.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoDimensions()}
<Popover.Root>
<Popover.Trigger>Open popover</Popover.Trigger>
<Popover.Content width="20rem">
<Popover.Header>
<Popover.Title>Dimensions</Popover.Title>
<Popover.Description>Set the dimensions for the layer.</Popover.Description>
</Popover.Header>

<div class="box">
<label for="demo-popover-width">Width</label>
<Input id="demo-popover-width" value="100%" />
</div>
<div class="box">
<label for="demo-popover-height">Height</label>
<Input id="demo-popover-height" value="25px" />
</div>
</Popover.Content>
</Popover.Root>
{/snippet}

{#snippet demoAlignment()}
<Popover.Root>
<Popover.Trigger>Open aligned</Popover.Trigger>
<Popover.Content align="start" side="right">
<Popover.Title>Aligned panel</Popover.Title>
<Popover.Description>Opens from the right edge of the trigger.</Popover.Description>
</Popover.Content>
</Popover.Root>
{/snippet}

{#snippet demoControlled()}
<Popover.Root bind:open={controlledOpen}>
<Popover.Trigger>{controlledOpen ? 'Close' : 'Open'} details</Popover.Trigger>
<Popover.Content>
<Popover.Title>Controlled popover</Popover.Title>
<Popover.Description>The open state is bound to page state.</Popover.Description>
<Popover.Close>Done</Popover.Close>
</Popover.Content>
</Popover.Root>
{/snippet}

<Examples
items={[
{ title: 'Dimensions', demo: demoDimensions, code: codeDimensions },
{ title: 'Alignment', demo: demoAlignment, code: codeAlignment },
{ title: 'Controlled', demo: demoControlled, code: codeControlled }
]}
/>

## Props

### Popover.Root

<PropsTable props={rootProps} />

### Popover.Trigger

<PropsTable props={triggerProps} />

### Popover.Content

<PropsTable props={contentProps} />

### Popover.Header, Popover.Title and Popover.Description

<PropsTable props={textProps} />

### Popover.Close

<PropsTable props={closeProps} />

## Theming

<div class="doc-table-wrap">

| Token                                | Used for                      |
| ------------------------------------ | ----------------------------- |
| `--popover` / `--popover-foreground` | Floating panel surface        |
| `--foreground`                       | Floating panel ring           |
| `--muted-foreground`                 | Description text              |
| `--border`                           | Trigger border                |
| `--background` / `--foreground`      | Trigger surface and text      |
| `--muted`                            | Trigger hover background      |
| `--ring`                             | Trigger focus-visible outline |
| `--radius`                           | Trigger radius                |

</div>
