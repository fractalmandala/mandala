<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils.js";
	export type DrawerHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: DrawerHeaderProps = $props();
</script>

<div bind:this={ref} data-slot="drawer-header" {...restProps}>
	{@render children?.()}
</div>
