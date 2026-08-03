<script lang="ts" module>
	import { Separator } from '$lib/components/separator/index.js';
	import type { WithElementRef } from '$lib/utils.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type FieldSeparatorProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: FieldSeparatorProps = $props();

	const hasContent = $derived(!!children);
</script>

<div bind:this={ref} data-slot="field-separator" data-content={hasContent} {...restProps}>
	<Separator data-slot="field-separator-line" orientation="horizontal" />
	{#if children}
		<span data-slot="field-separator-content">
			{@render children()}
		</span>
	{/if}
</div>
