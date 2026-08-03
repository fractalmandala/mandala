<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarInsetProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarInsetProps = $props();
</script>

<main bind:this={ref} data-slot="sidebar-inset" {...restProps}>
	{@render children?.()}
</main>
