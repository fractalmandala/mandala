<script lang="ts" module>
	export type TokensWithCostProps = {
		tokens?: number;
		costText?: string;
	};
</script>

<script lang="ts">
	let { tokens, costText }: TokensWithCostProps = $props();

	let tokensFormatted = $derived.by(() => {
		return tokens === undefined
			? "—"
			: new Intl.NumberFormat("en-US", {
					notation: "compact",
				}).format(tokens);
	});
</script>

<span data-slot="tokens-with-cost">
	{tokensFormatted}
	{#if costText}
		<span data-slot="tokens-cost-text">• {costText}</span>
	{/if}
</span>
