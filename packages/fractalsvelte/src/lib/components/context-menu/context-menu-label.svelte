<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ContextMenuLabelProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		inset?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		children,
		...restProps
	}: ContextMenuLabelProps = $props();
</script>

<div bind:this={ref} data-slot="context-menu-label" data-inset={inset || undefined} {...restProps}>
	{@render children?.()}
</div>
