<script lang="ts">
	import * as Tooltip from '$lib/components/tooltip';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as Tooltip from "fractalsvelte/tooltip";
<\/script>

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>Hover</Tooltip.Trigger>
    <Tooltip.Content>Add to library</Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>`;

	const codeVariants = `<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger variant="outline">Outline</Tooltip.Trigger>
    <Tooltip.Content>Outline trigger</Tooltip.Content>
  </Tooltip.Root>

  <Tooltip.Root>
    <Tooltip.Trigger variant="ghost">Ghost</Tooltip.Trigger>
    <Tooltip.Content>Ghost trigger</Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>`;

	const codeSides = `<Tooltip.Provider delayDuration={0}>
  <Tooltip.Root>
    <Tooltip.Trigger>Right side</Tooltip.Trigger>
    <Tooltip.Content side="right" sideOffset={6}>
      Opens from the right edge.
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>`;

	const codeWidth = `<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>Explain</Tooltip.Trigger>
    <Tooltip.Content maxWidth="14rem">
      Tooltips can wrap when a longer note needs to stay readable.
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>`;

	const providerProps: PropRow[] = [
		{
			name: 'delayDuration',
			type: 'number',
			default: '0',
			description: 'Delay in milliseconds before a tooltip opens.'
		},
		{
			name: 'skipDelayDuration',
			type: 'number',
			default: '300',
			description: 'Window for moving between triggers without repeating the delay.'
		},
		{
			name: 'disableHoverableContent',
			type: 'boolean',
			default: 'false',
			description: 'Close the tooltip when the pointer leaves the trigger.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Disable all tooltips inside the provider.'
		},
		{ name: 'children', type: 'Snippet', description: 'Tooltip roots inside the provider.' }
	];

	const rootProps: PropRow[] = [
		{ name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state.' },
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			description: 'Called when the open state changes.'
		},
		{
			name: 'delayDuration',
			type: 'number',
			description: 'Per-tooltip open delay override.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Prevents this tooltip from opening.'
		},
		{ name: 'children', type: 'Snippet', description: 'Trigger and floating content.' }
	];

	const triggerProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "outline" | "ghost"',
			default: '"outline"',
			description: 'Default trigger style, rendered as data-variant.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Disables the trigger.'
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
			name: 'side',
			type: '"top" | "right" | "bottom" | "left"',
			default: '"top"',
			description: 'Preferred side for the floating panel.'
		},
		{
			name: 'align',
			type: '"start" | "center" | "end"',
			default: '"center"',
			description: 'Alignment against the trigger.'
		},
		{
			name: 'sideOffset',
			type: 'number',
			default: '0',
			description: 'Distance in pixels between trigger and content.'
		},
		{
			name: 'width',
			type: 'string',
			description: 'CSS width for the floating panel. Omit for fit-content.'
		},
		{
			name: 'maxWidth',
			type: 'string',
			description: 'CSS max-width for wrapping tooltip text.'
		},
		{
			name: 'portalProps',
			type: 'Tooltip.PortalProps',
			description: 'Props passed to the portal wrapper.'
		},
		{ name: 'child', type: 'Snippet', description: 'Render custom content markup.' },
		{ name: 'children', type: 'Snippet', description: 'Tooltip body content.' },
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the floating content.'
		}
	];
</script>

<h1 class="doc-title">Tooltip</h1>
<p class="doc-lede">Displays a short floating label when a trigger receives hover or keyboard focus.</p>

<Preview description="Tooltip — basic" code={usage}>
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>Hover</Tooltip.Trigger>
			<Tooltip.Content>Add to library</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
</Preview>

## Installation

<CodeBlock code={codeInstall} lang="bash" />

Copy `src/lib/components/tooltip` into your project and import the component stylesheet from
your SASS entry point.

## Usage

<CodeBlock code={usage} lang="svelte" />

## Examples

{#snippet demoVariants()}

<div class="row ycenter" style="gap: 0.75rem; flex-wrap: wrap">
<Tooltip.Provider>
<Tooltip.Root>
<Tooltip.Trigger variant="outline">Outline</Tooltip.Trigger>
<Tooltip.Content>Outline trigger</Tooltip.Content>
</Tooltip.Root>
<Tooltip.Root>
<Tooltip.Trigger variant="ghost">Ghost</Tooltip.Trigger>
<Tooltip.Content>Ghost trigger</Tooltip.Content>
</Tooltip.Root>
</Tooltip.Provider>
</div>
{/snippet}

{#snippet demoSides()}
<Tooltip.Provider delayDuration={0}>
<Tooltip.Root>
<Tooltip.Trigger>Right side</Tooltip.Trigger>
<Tooltip.Content side="right" sideOffset={6}>Opens from the right edge.</Tooltip.Content>
</Tooltip.Root>
</Tooltip.Provider>
{/snippet}

{#snippet demoWidth()}
<Tooltip.Provider>
<Tooltip.Root>
<Tooltip.Trigger>Explain</Tooltip.Trigger>
<Tooltip.Content maxWidth="14rem">
Tooltips can wrap when a longer note needs to stay readable.
</Tooltip.Content>
</Tooltip.Root>
</Tooltip.Provider>
{/snippet}

<Examples
items={[
{ title: 'Variants', demo: demoVariants, code: codeVariants },
{ title: 'Sides', demo: demoSides, code: codeSides },
{ title: 'Width', demo: demoWidth, code: codeWidth }
]}
/>

## Props

### Provider

<PropsTable props={providerProps} />

### Root

<PropsTable props={rootProps} />

### Trigger

<PropsTable props={triggerProps} />

### Content

<PropsTable props={contentProps} />

## Theming

Tooltip reads `--foreground`, `--background`, `--primary`, `--primary-foreground`,
`--border`, `--muted`, `--ring`, `--radius`, and the text scale tokens.
