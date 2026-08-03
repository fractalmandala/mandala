<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ContextContentFooterProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { getContextValue, estimateCost } from "./context-context.svelte.js";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ContextContentFooterProps = $props();

	let context = getContextValue();

	let totalCost = $derived.by(() => {
		const costUSD = context.modelId
			? estimateCost({
					modelId: context.modelId,
					usage: {
						input: context.usage?.inputTokens ?? 0,
						output: context.usage?.outputTokens ?? 0,
					},
				}).totalUSD
			: undefined;

		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(costUSD ?? 0);
	});
</script>

<div
	bind:this={ref}
	data-slot="context-content-footer"
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		<span data-slot="context-footer-label">Total cost</span>
		<span data-slot="context-footer-value">{totalCost}</span>
	{/if}
</div>
