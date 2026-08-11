<script lang="ts">
	import { Badge } from '$lib/components/badge/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const rootProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"',
			default: '"default"',
			description: 'Tone variant.'
		},
		{
			name: 'href',
			type: 'string',
			description: 'Renders badge as an anchor tag when supplied.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;
	const usage = `<script lang="ts">
  import { Badge } from "fractalsvelte/badge";
<\/script>

<Badge>Badge</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>`;
</script>

<h1 class="doc-title">Badge</h1>
<p class="doc-lede">Displays a badge or a component that looks like a badge.</p>

<Preview description="Badge - default" code={usage}>
	<div style="display:flex; gap:0.5rem; justify-content:center; align-items:center;">
		<Badge>Badge</Badge>
		<Badge variant="secondary">Secondary</Badge>
		<Badge variant="outline">Outline</Badge>
		<Badge variant="destructive">Destructive</Badge>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Props

### Badge

<PropsTable props={rootProps} />
