<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { CollapsibleContent } from '$lib/components/collapsible/index.js';

	export type QueueSectionContentProps = ComponentProps<typeof CollapsibleContent>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: QueueSectionContentProps = $props();
</script>

<CollapsibleContent bind:ref data-slot="queue-section-content" {...restProps}>
	{@render children?.()}
</CollapsibleContent>
