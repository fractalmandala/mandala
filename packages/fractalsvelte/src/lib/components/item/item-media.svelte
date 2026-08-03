<script lang="ts" module>
	import type { Radius } from '$lib/types.js';
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ItemMediaVariant = 'default' | 'icon' | 'image';

	export type ItemMediaProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: ItemMediaVariant;
		radius?: Radius;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		variant = 'default',
		radius,
		...restProps
	}: ItemMediaProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="item-media"
	data-variant={variant}
	data-radius={radius}
	{...restProps}
>
	{@render children?.()}
</div>
