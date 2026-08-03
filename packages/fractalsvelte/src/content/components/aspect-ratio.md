<script lang="ts">
	import * as AspectRatio from '$lib/components/aspect-ratio/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const rootProps: PropRow[] = [
		{
			name: 'ratio',
			type: 'number',
			default: '1',
			description: 'Desired aspect ratio (e.g. 16/9).'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;
	const usage = `<script lang="ts">
  import * as AspectRatio from "fractalsvelte/aspect-ratio";
<\/script>

<div style="width: 300px;">
  <AspectRatio.Root ratio={16 / 9}>
    <img
      src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
      alt="Landscape photo"
      style="object-fit: cover; width: 100%; height: 100%; border-radius: 0.5rem;"
    />
  </AspectRatio.Root>
</div>`;
</script>

<h1 class="doc-title">Aspect Ratio</h1>
<p class="doc-lede">Displays content within a desired aspect ratio.</p>

<Preview description="Aspect Ratio - 16:9" code={usage}>
	<div style="width: 300px; margin-inline: auto;">
		<AspectRatio.Root ratio={16 / 9}>
			<img
				src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
				alt="Landscape photo"
				style="object-fit: cover; width: 100%; height: 100%; border-radius: 0.5rem;"
			/>
		</AspectRatio.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Props

### AspectRatio.Root

<PropsTable props={rootProps} />
