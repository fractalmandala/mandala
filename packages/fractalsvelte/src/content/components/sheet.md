<script lang="ts">
	import { Button } from '$lib/components/button/index.js';
	import * as Sheet from '$lib/components/sheet/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const contentProps: PropRow[] = [
		{
			name: 'side',
			type: '"top" | "right" | "bottom" | "left"',
			default: '"right"',
			description: 'Direction from which the sheet enters.'
		},
		{
			name: 'showCloseButton',
			type: 'boolean',
			default: 'true',
			description: 'Whether to display the top-right close icon button.'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;
	const usage = `<script lang="ts">
  import * as Sheet from "fractalsvelte/sheet";
  import { Button } from "fractalsvelte/button";
<\/script>

<Sheet.Root>
  <Sheet.Trigger>
    {#snippet child({ props })}
      <Button variant="outline" {...props}>Open Sheet</Button>
    {/snippet}
  </Sheet.Trigger>
  <Sheet.Content side="right">
    <Sheet.Header>
      <Sheet.Title>Edit profile</Sheet.Title>
      <Sheet.Description>Make changes to your profile here. Click save when you're done.</Sheet.Description>
    </Sheet.Header>
  </Sheet.Content>
</Sheet.Root>`;
</script>

<h1 class="doc-title">Sheet</h1>
<p class="doc-lede">Extends the Dialog component to display content that complements the main content of the screen.</p>

<Preview description="Sheet - basic" code={usage}>
	<div style="display: flex; justify-content: center;">
		<Sheet.Root>
			<Sheet.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>Open Sheet</Button>
				{/snippet}
			</Sheet.Trigger>
			<Sheet.Content side="right">
				<Sheet.Header>
					<Sheet.Title>Edit profile</Sheet.Title>
					<Sheet.Description>Make changes to your profile here. Click save when you're done.</Sheet.Description>
				</Sheet.Header>
			</Sheet.Content>
		</Sheet.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Props

### Sheet.Content

<PropsTable props={contentProps} />
