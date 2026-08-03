<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ItemTitleClamp = 1 | 2 | 'none';

	export type ItemTitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		clamp?: ItemTitleClamp;
	};
</script>

<script lang="ts">
	let { ref = $bindable(null), children, clamp = 1, ...restProps }: ItemTitleProps = $props();
</script>

<div bind:this={ref} data-slot="item-title" data-clamp={clamp} {...restProps}>
	{@render children?.()}
</div>
