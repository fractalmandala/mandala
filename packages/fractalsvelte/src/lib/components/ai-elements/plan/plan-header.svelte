<script lang="ts" module>
	export type { PlanHeaderProps } from './types.js';
</script>

<script lang="ts">
	import { CardHeader } from '$lib/components/card/index.js';
	import type { PlanHeaderProps } from './types.js';

	let { children, ...restProps }: PlanHeaderProps = $props();
</script>

<!-- Keep data-slot=card-header so card.sass applies; chrome via data-plan-header. -->
<CardHeader data-plan-header="true" {...restProps}>
	{@render children?.()}
</CardHeader>
