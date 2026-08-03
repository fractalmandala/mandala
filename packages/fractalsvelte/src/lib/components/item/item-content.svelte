<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ItemContentGap = 'default' | 'none' | 'xs' | 'sm';
	export type ItemContentAlign = 'start' | 'center' | 'end';

	export type ItemContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		gap?: ItemContentGap;
		align?: ItemContentAlign;
		grow?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		gap = 'default',
		align,
		grow = true,
		...restProps
	}: ItemContentProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="item-content"
	data-gap={gap}
	data-align={align}
	data-grow={grow}
	{...restProps}
>
	{@render children?.()}
</div>
