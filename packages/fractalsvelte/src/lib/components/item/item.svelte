<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ItemVariant = 'default' | 'outline' | 'muted';
	export type ItemSize = 'default' | 'sm' | 'xs';

	export type ItemProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: ItemVariant;
		size?: ItemSize;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		child,
		children,
		variant = 'default',
		size = 'default',
		...restProps
	}: ItemProps = $props();

	const mergedProps = $derived({
		'data-slot': 'item',
		'data-variant': variant,
		'data-size': size,
		...restProps
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
