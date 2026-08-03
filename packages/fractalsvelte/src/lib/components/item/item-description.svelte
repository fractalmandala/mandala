<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ItemDescriptionClamp = 1 | 2 | 'none';

	export type ItemDescriptionProps = WithElementRef<HTMLAttributes<HTMLParagraphElement>> & {
		clamp?: ItemDescriptionClamp;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		clamp = 2,
		...restProps
	}: ItemDescriptionProps = $props();
</script>

<p bind:this={ref} data-slot="item-description" data-clamp={clamp} {...restProps}>
	{@render children?.()}
</p>
