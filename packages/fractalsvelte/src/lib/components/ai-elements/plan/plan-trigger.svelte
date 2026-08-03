<script lang="ts" module>
	export type { PlanTriggerProps } from './types.js';
</script>

<script lang="ts">
	import { CollapsibleTrigger } from '$lib/components/collapsible/index.js';
	import { Button } from '$lib/components/button/index.js';
	import type { PlanTriggerProps } from './types.js';

	let { children, ref = $bindable(null), ...restProps }: PlanTriggerProps = $props();
</script>

<!--
	Merge collapsible trigger behaviour onto Button via child snippet so we do not nest
	buttons. Strip collapsible data-slot so button.sass still applies.
-->
<CollapsibleTrigger {...restProps}>
	{#snippet child({ props })}
		{@const cleaned = (() => {
			const { 'data-slot': _s, ...rest } = (props ?? {}) as Record<string, unknown>;
			return rest;
		})()}
		<Button
			bind:ref
			type="button"
			variant="ghost"
			size="icon"
			data-plan-trigger="true"
			{...cleaned}
		>
			{#if children}
				{@render children()}
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="m7 15 5 5 5-5" />
					<path d="m7 9 5-5 5 5" />
				</svg>
				<span data-slot="plan-trigger-label">Toggle plan</span>
			{/if}
		</Button>
	{/snippet}
</CollapsibleTrigger>
