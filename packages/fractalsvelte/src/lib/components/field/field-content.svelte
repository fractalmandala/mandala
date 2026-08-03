<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type FieldContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: FieldContentProps = $props();
</script>

<div bind:this={ref} data-slot="field-content" {...restProps}>
	{@render children?.()}
</div>
