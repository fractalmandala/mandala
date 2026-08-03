<script lang="ts" module>
	import { Pagination as PaginationPrimitive } from "bits-ui";

	export type PaginationNextProps = PaginationPrimitive.NextButtonProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: PaginationNextProps = $props();
</script>

<PaginationPrimitive.NextButton
	bind:ref
	aria-label="Go to next page"
	data-slot="pagination-next"
	data-variant="ghost"
	data-size="default"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<span class="pagination-next-text">Next</span>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m9 18 6-6-6-6" />
		</svg>
	{/if}
</PaginationPrimitive.NextButton>
