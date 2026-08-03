<script lang="ts" module>
	export type { PlanProps } from './types.js';
</script>

<script lang="ts">
	import { Collapsible } from '$lib/components/collapsible/index.js';
	import { Card } from '$lib/components/card/index.js';
	import { setPlanContext } from './plan-context.svelte.js';
	import type { PlanProps } from './types.js';

	let {
		isStreaming = false,
		open = $bindable(undefined),
		children,
		ref = $bindable(null),
		...restProps
	}: PlanProps = $props();

	// Reactive getter so title/description re-read isStreaming when it changes.
	setPlanContext({
		get isStreaming() {
			return isStreaming;
		}
	});
</script>

<Collapsible bind:ref bind:open data-slot="plan" {...restProps}>
	<Card data-slot="card" data-plan-card="true">
		{@render children?.()}
	</Card>
</Collapsible>
