<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type FieldOrientation = 'vertical' | 'horizontal' | 'responsive';

	export type FieldProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		orientation?: FieldOrientation;
		/** Applies the field error colour to the whole group. */
		invalid?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		orientation = 'vertical',
		invalid = false,
		children,
		...restProps
	}: FieldProps = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="field"
	data-orientation={orientation}
	data-invalid={invalid || undefined}
	{...restProps}
>
	{@render children?.()}
</div>
