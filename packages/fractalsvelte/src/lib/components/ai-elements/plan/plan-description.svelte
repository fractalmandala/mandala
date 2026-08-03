<script lang="ts" module>
	export type { PlanDescriptionProps } from './types.js';
</script>

<script lang="ts">
	import { CardDescription } from '$lib/components/card/index.js';
	import { Shimmer } from '$lib/components/ai-elements/shimmer/index.js';
	import { getPlanContext } from './plan-context.svelte.js';
	import type { PlanDescriptionProps } from './types.js';

	let { children, ...restProps }: PlanDescriptionProps = $props();

	const ctx = getPlanContext();
</script>

<CardDescription data-plan-description="true" {...restProps}>
	{#if ctx.isStreaming}
		<Shimmer as="span" contentLength={80}>{@render children()}</Shimmer>
	{:else}
		{@render children()}
	{/if}
</CardDescription>
