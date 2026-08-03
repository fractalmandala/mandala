<script lang="ts" module>
	export type { PlanContentProps } from './types.js';
</script>

<script lang="ts">
	import { CollapsibleContent } from '$lib/components/collapsible/index.js';
	import { CardContent } from '$lib/components/card/index.js';
	import type { PlanContentProps } from './types.js';

	let { children, ...restProps }: PlanContentProps = $props();
</script>

<CollapsibleContent data-slot="plan-collapsible-content">
	<CardContent data-plan-content="true" {...restProps}>
		{@render children?.()}
	</CardContent>
</CollapsibleContent>
