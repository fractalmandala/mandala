<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type MenubarLabelProps = WithElementRef<HTMLAttributes<HTMLElement>> & {
		inset?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		children,
		...restProps
	}: MenubarLabelProps = $props();
</script>

<div bind:this={ref} data-slot="menubar-label" data-inset={inset || undefined} {...restProps}>
	{@render children?.()}
</div>
