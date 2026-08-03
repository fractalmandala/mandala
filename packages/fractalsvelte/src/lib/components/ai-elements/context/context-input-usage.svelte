<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ContextInputUsageProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { getContextValue, estimateCost } from "./context-context.svelte.js";
	import TokensWithCost from "./tokens-with-cost.svelte";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ContextInputUsageProps = $props();

	let context = getContextValue();

	let inputTokens = $derived.by(() => context.usage?.inputTokens ?? 0);

	let inputCostText = $derived.by(() => {
		if (!inputTokens || !context.modelId) return undefined;

		const inputCost = estimateCost({
			modelId: context.modelId,
			usage: { input: inputTokens, output: 0 },
		}).totalUSD;

		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(inputCost);
	});
</script>

{#if children}
	{@render children()}
{:else if inputTokens}
	<div
		bind:this={ref}
		data-slot="context-usage-row"
		{...restProps}
	>
		<span data-slot="context-usage-label">Input</span>
		<TokensWithCost tokens={inputTokens} costText={inputCostText} />
	</div>
{/if}
