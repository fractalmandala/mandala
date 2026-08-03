<script lang="ts" module>
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import type { ButtonSize } from "../button/button.svelte";

	export type PaginationLinkProps = PaginationPrimitive.PageProps & {
		size?: ButtonSize;
		isActive?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		size = "icon",
		isActive = false,
		page,
		children,
		...restProps
	}: PaginationLinkProps = $props();
</script>

<PaginationPrimitive.Page
	bind:ref
	{page}
	aria-current={isActive ? "page" : undefined}
	data-slot="pagination-link"
	data-variant={isActive ? "outline" : "ghost"}
	data-size={size}
	data-active={isActive}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{page.value}
	{/if}
</PaginationPrimitive.Page>
