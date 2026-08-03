<script lang="ts" module>
	import { Pagination as PaginationPrimitive } from "bits-ui";

	export type PaginationProps = PaginationPrimitive.RootProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		count = 0,
		perPage = 10,
		page = $bindable(1),
		siblingCount = 1,
		children,
		...restProps
	}: PaginationProps = $props();
</script>

<PaginationPrimitive.Root
	bind:ref
	bind:page
	role="navigation"
	aria-label="pagination"
	data-slot="pagination"
	{count}
	{perPage}
	{siblingCount}
	{...restProps}
>
	{#snippet children(builder)}
		{@render children?.(builder)}
	{/snippet}
</PaginationPrimitive.Root>
