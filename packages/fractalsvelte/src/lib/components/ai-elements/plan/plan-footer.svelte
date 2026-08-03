<script lang="ts" module>
	export type { PlanFooterProps } from './types.js';
</script>

<script lang="ts">
	import { CardFooter } from '$lib/components/card/index.js';
	import type { PlanFooterProps } from './types.js';

	let { children, ...restProps }: PlanFooterProps = $props();
</script>

<CardFooter data-plan-footer="true" {...restProps}>
	{@render children?.()}
</CardFooter>
