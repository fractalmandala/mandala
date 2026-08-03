<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ButtonGroupOrientation = 'horizontal' | 'vertical';

	export type ButtonGroupProps = WithElementRef<
		HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> & {
		orientation?: ButtonGroupOrientation;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		orientation = 'horizontal',
		...restProps
	}: ButtonGroupProps = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="button-group"
	data-orientation={orientation}
	{...restProps}
>
	{@render children?.()}
</div>
