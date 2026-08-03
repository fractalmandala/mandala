<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type DialogHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: DialogHeaderProps = $props();
</script>

<div bind:this={ref} data-slot="dialog-header" {...restProps}>
	{@render children?.()}
</div>
