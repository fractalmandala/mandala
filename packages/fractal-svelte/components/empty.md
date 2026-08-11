<script lang="ts">
	import { Button } from '$lib/components/button/index.js';
	import * as Empty from '$lib/components/empty/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const mediaProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "icon"',
			default: '"default"',
			description: 'Media container layout style.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;
	const usage = `<script lang="ts">
  import * as Empty from "fractalsvelte/empty";
  import { Button } from "fractalsvelte/button";
<\/script>

<Empty.Root>
  <Empty.Header>
    <Empty.Title>No results found</Empty.Title>
    <Empty.Description>No items matched your search query. Try adjusting your filters.</Empty.Description>
  </Empty.Header>
  <Empty.Content>
    <Button>Clear filters</Button>
  </Empty.Content>
</Empty.Root>`;
</script>

<h1 class="doc-title">Empty</h1>
<p class="doc-lede">Placeholder container for empty states, zero search results, or onboarding.</p>

<Preview description="Empty - default" code={usage}>
	<div style="max-width: 28rem; margin-inline: auto;">
		<Empty.Root>
			<Empty.Header>
				<Empty.Title>No results found</Empty.Title>
				<Empty.Description>No items matched your search query. Try adjusting your filters.</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button>Clear filters</Button>
			</Empty.Content>
		</Empty.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Props

### Empty.Media

<PropsTable props={mediaProps} />
