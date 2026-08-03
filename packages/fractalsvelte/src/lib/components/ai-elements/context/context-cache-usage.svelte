<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ContextCacheUsageProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { getContextValue, estimateCost } from "./context-context.svelte.js";
	import TokensWithCost from "./tokens-with-cost.svelte";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ContextCacheUsageProps = $props();

	let context = getContextValue();

	let cachedTokens = $derived.by(() => context.usage?.cachedInputTokens ?? 0);

	let cacheCostText = $derived.by(() => {
		if (!cachedTokens || !context.modelId) return undefined;

		const cacheCost = estimateCost({
			modelId: context.modelId,
			usage: { cacheReads: cachedTokens },
		}).totalUSD;

		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(cacheCost);
	});
</script>

{#if children}
	{@render children()}
{:else if cachedTokens}
	<div
		bind:this={ref}
		data-slot="context-usage-row"
		{...restProps}
	>
		<span data-slot="context-usage-label">Cached</span>
		<TokensWithCost tokens={cachedTokens} costText={cacheCostText} />
	</div>
{/if}
