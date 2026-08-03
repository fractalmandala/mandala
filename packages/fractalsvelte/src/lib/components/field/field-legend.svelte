<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type FieldLegendVariant = 'legend' | 'label';

	export type FieldLegendProps = WithElementRef<
		HTMLAttributes<HTMLLegendElement>,
		HTMLLegendElement
	> & {
		variant?: FieldLegendVariant;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		variant = 'legend',
		children,
		...restProps
	}: FieldLegendProps = $props();
</script>

<legend bind:this={ref} data-slot="field-legend" data-variant={variant} {...restProps}>
	{@render children?.()}
</legend>
