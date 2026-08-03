<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ChainOfThoughtImageProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		caption?: string;
	};
</script>

<script lang="ts">
	let {
		caption,
		children,
		ref = $bindable(null),
		...restProps
	}: ChainOfThoughtImageProps = $props();
</script>

<div bind:this={ref} data-slot="chain-of-thought-image" {...restProps}>
	<div data-slot="chain-of-thought-image-frame">
		{@render children?.()}
	</div>
	{#if caption}
		<p data-slot="chain-of-thought-image-caption">{caption}</p>
	{/if}
</div>
