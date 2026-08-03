<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type FieldTitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: FieldTitleProps = $props();
</script>

<div bind:this={ref} data-slot="field-title" {...restProps}>
	{@render children?.()}
</div>
