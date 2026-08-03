<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ItemHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: ItemHeaderProps = $props();
</script>

<div bind:this={ref} data-slot="item-header" {...restProps}>
	{@render children?.()}
</div>
