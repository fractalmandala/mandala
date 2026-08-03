<script lang="ts">
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLLiAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: WithElementRef<HTMLLiAttributes> = $props();
</script>

<li
	bind:this={ref}
	data-slot="breadcrumb-separator"
	role="presentation"
	aria-hidden="true"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<!-- Decorative chevron, inline because the library ships no icon dependency.
		     Pass children to substitute anything else, e.g. a slash. -->
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="m9 18 6-6-6-6" />
		</svg>
	{/if}
</li>
