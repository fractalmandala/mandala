<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type PaginationContentProps = WithElementRef<HTMLAttributes<HTMLUListElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: PaginationContentProps = $props();
</script>

<ul
	bind:this={ref}
	data-slot="pagination-content"
	{...restProps}
>
	{@render children?.()}
</ul>
