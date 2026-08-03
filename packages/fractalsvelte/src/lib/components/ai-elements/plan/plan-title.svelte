<script lang="ts" module>
	export type { PlanTitleProps } from './types.js';
</script>

<script lang="ts">
	import { CardTitle } from '$lib/components/card/index.js';
	import { Shimmer } from '$lib/components/ai-elements/shimmer/index.js';
	import { getPlanContext } from './plan-context.svelte.js';
	import type { PlanTitleProps } from './types.js';

	let { children, ...restProps }: PlanTitleProps = $props();

	const ctx = getPlanContext();
</script>

<CardTitle data-plan-title="true" {...restProps}>
	{#if ctx.isStreaming}
		<Shimmer as="span" contentLength={50}>{@render children()}</Shimmer>
	{:else}
		{@render children()}
	{/if}
</CardTitle>
