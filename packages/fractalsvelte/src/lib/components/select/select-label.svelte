<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type SelectLabelProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: SelectLabelProps = $props();
</script>

<div bind:this={ref} data-slot="select-label" {...restProps}>
	{@render children?.()}
</div>
