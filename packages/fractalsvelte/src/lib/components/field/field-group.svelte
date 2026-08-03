<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type FieldGroupGap = 'default' | 'compact';

	export type FieldGroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Compact spacing for checkbox/radio groups. */
		gap?: FieldGroupGap;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		gap = 'default',
		children,
		...restProps
	}: FieldGroupProps = $props();
</script>

<div bind:this={ref} data-slot="field-group" data-gap={gap} {...restProps}>
	{@render children?.()}
</div>
