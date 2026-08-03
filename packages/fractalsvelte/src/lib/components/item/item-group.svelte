<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ItemGroupLayout = 'default' | 'grid';
	export type ItemGroupGap = 'default' | 'xs' | 'sm' | 'lg';

	export type ItemGroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		layout?: ItemGroupLayout;
		gap?: ItemGroupGap;
		columns?: string;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		layout = 'default',
		gap = 'default',
		columns,
		style,
		...restProps
	}: ItemGroupProps = $props();

	const groupStyle = $derived(
		columns ? `--item-group-columns: ${columns};${style ?? ''}` : style
	);
</script>

<div
	bind:this={ref}
	role="list"
	data-slot="item-group"
	data-layout={layout}
	data-gap={gap}
	style={groupStyle}
	{...restProps}
>
	{@render children?.()}
</div>
