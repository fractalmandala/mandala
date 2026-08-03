<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ContextContentHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { Progress } from "$lib/components/progress/index.js";
	import { getContextValue, PERCENT_MAX } from "./context-context.svelte.js";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ContextContentHeaderProps = $props();

	const context = getContextValue();
</script>

<div
	bind:this={ref}
	data-slot="context-content-header"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<div data-slot="context-header-info">
			<p>{context.displayPercent}</p>
			<p data-slot="context-header-tokens">
				{context.usedTokensFormatted} / {context.maxTokensFormatted}
			</p>
		</div>
		<Progress value={context.usedPercent * PERCENT_MAX} />
	{/if}
</div>
