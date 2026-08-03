<script lang="ts" module>
	import { Pagination as PaginationPrimitive } from "bits-ui";

	export type PaginationPreviousProps = PaginationPrimitive.PrevButtonProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: PaginationPreviousProps = $props();
</script>

<PaginationPrimitive.PrevButton
	bind:ref
	aria-label="Go to previous page"
	data-slot="pagination-previous"
	data-variant="ghost"
	data-size="default"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m15 18-6-6 6-6" />
		</svg>
		<span class="pagination-previous-text">Previous</span>
	{/if}
</PaginationPrimitive.PrevButton>
