<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils.js";
	export type DrawerFooterProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: DrawerFooterProps = $props();
</script>

<div bind:this={ref} data-slot="drawer-footer" {...restProps}>
	{@render children?.()}
</div>
