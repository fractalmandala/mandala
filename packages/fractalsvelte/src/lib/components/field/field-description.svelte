<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type FieldDescriptionProps = WithElementRef<
		HTMLAttributes<HTMLParagraphElement>,
		HTMLParagraphElement
	>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: FieldDescriptionProps = $props();
</script>

<p bind:this={ref} data-slot="field-description" {...restProps}>
	{@render children?.()}
</p>
