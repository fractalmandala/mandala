<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type LoaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Icon size in CSS pixels. Default `16`. */
		size?: number;
		/** Optional custom spinner; defaults to the built-in radial bars. */
		children?: Snippet;
	};
</script>

<script lang="ts">
	import LoaderIcon from './loader-icon.svelte';

	let {
		size = 16,
		children,
		ref = $bindable(null),
		...restProps
	}: LoaderProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="ai-loader"
	role="status"
	aria-label="Loading"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<LoaderIcon {size} />
	{/if}
</div>
