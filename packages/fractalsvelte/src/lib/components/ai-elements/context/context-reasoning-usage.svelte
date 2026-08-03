<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ContextReasoningUsageProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { getContextValue, estimateCost } from "./context-context.svelte.js";
	import TokensWithCost from "./tokens-with-cost.svelte";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ContextReasoningUsageProps = $props();

	let context = getContextValue();

	let reasoningTokens = $derived.by(() => context.usage?.reasoningTokens ?? 0);

	let reasoningCostText = $derived.by(() => {
		if (!reasoningTokens || !context.modelId) return undefined;

		const reasoningCost = estimateCost({
			modelId: context.modelId,
			usage: { reasoningTokens },
		}).totalUSD;

		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(reasoningCost);
	});
</script>

{#if children}
	{@render children()}
{:else if reasoningTokens}
	<div
		bind:this={ref}
		data-slot="context-usage-row"
		{...restProps}
	>
		<span data-slot="context-usage-label">Reasoning</span>
		<TokensWithCost tokens={reasoningTokens} costText={reasoningCostText} />
	</div>
{/if}
