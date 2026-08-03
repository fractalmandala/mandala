<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import type { Snippet } from 'svelte';
	import { CollapsibleTrigger } from '$lib/components/collapsible/index.js';

	export type QueueSectionTriggerProps = Omit<
		ComponentProps<typeof CollapsibleTrigger>,
		'children'
	> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: QueueSectionTriggerProps = $props();
</script>

<!-- Own data-slot overrides bordered collapsible-trigger chrome into a muted row. -->
<CollapsibleTrigger
	bind:ref
	data-slot="queue-section-trigger"
	{...restProps}
>
	{@render children?.()}
</CollapsibleTrigger>
