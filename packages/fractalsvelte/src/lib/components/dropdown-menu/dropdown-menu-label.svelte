<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type DropdownMenuLabelProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		inset?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		children,
		...restProps
	}: DropdownMenuLabelProps = $props();
</script>

<div bind:this={ref} data-slot="dropdown-menu-label" data-inset={inset || undefined} {...restProps}>
	{@render children?.()}
</div>
