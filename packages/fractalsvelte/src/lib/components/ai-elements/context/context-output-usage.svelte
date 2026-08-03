<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ContextOutputUsageProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { getContextValue, estimateCost } from "./context-context.svelte.js";
	import TokensWithCost from "./tokens-with-cost.svelte";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ContextOutputUsageProps = $props();

	let context = getContextValue();

	let outputTokens = $derived.by(() => context.usage?.outputTokens ?? 0);

	let outputCostText = $derived.by(() => {
		if (!outputTokens || !context.modelId) return undefined;

		const outputCost = estimateCost({
			modelId: context.modelId,
			usage: { input: 0, output: outputTokens },
		}).totalUSD;

		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(outputCost);
	});
</script>

{#if children}
	{@render children()}
{:else if outputTokens}
	<div
		bind:this={ref}
		data-slot="context-usage-row"
		{...restProps}
	>
		<span data-slot="context-usage-label">Output</span>
		<TokensWithCost tokens={outputTokens} costText={outputCostText} />
	</div>
{/if}
