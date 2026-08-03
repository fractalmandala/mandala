<script lang="ts">
	import * as Alert from '$lib/components/alert/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const rootProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "destructive"',
			default: '"default"',
			description: 'Visual callout tone. Rendered as data-variant.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;
	const usage = `<script lang="ts">
  import * as Alert from "fractalsvelte/alert";
<\/script>

<Alert.Root>
  <Alert.Title>Heads up!</Alert.Title>
  <Alert.Description>You can add components to your app using the cli.</Alert.Description>
</Alert.Root>`;

	const codeDestructive = `<Alert.Root variant="destructive">
  <Alert.Title>Error</Alert.Title>
  <Alert.Description>Your session has expired. Please log in again.</Alert.Description>
</Alert.Root>`;
</script>

<h1 class="doc-title">Alert</h1>
<p class="doc-lede">Displays a callout for user attention.</p>

<Preview description="Alert - default" code={usage}>
	<div style="max-width: 28rem; margin-inline: auto;">
		<Alert.Root>
			<Alert.Title>Heads up!</Alert.Title>
			<Alert.Description>You can add components to your app using the cli.</Alert.Description>
		</Alert.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoDefault()}
<div style="max-width: 28rem; margin-inline: auto;">
	<Alert.Root>
		<Alert.Title>Heads up!</Alert.Title>
		<Alert.Description>You can add components to your app using the cli.</Alert.Description>
	</Alert.Root>
</div>
{/snippet}

{#snippet demoDestructive()}
<div style="max-width: 28rem; margin-inline: auto;">
	<Alert.Root variant="destructive">
		<Alert.Title>Error</Alert.Title>
		<Alert.Description>Your session has expired. Please log in again.</Alert.Description>
	</Alert.Root>
</div>
{/snippet}

<Examples
	items={[
		{ title: 'Default', demo: demoDefault, code: usage },
		{ title: 'Destructive', demo: demoDestructive, code: codeDestructive }
	]}
/>

## Props

### Alert.Root

<PropsTable props={rootProps} />
