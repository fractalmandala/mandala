<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ActionsProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: ActionsProps = $props();
</script>

<div bind:this={ref} data-slot="actions" {...restProps}>
	{@render children?.()}
</div>
