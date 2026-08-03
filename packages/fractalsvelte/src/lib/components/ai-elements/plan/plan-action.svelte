<script lang="ts" module>
	export type { PlanActionProps } from './types.js';
</script>

<script lang="ts">
	import { CardAction } from '$lib/components/card/index.js';
	import type { PlanActionProps } from './types.js';

	let { children, ...restProps }: PlanActionProps = $props();
</script>

<CardAction data-plan-action="true" {...restProps}>
	{@render children?.()}
</CardAction>
