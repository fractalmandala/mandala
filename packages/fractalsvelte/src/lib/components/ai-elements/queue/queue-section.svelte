<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Collapsible } from '$lib/components/collapsible/index.js';

	export type QueueSectionProps = ComponentProps<typeof Collapsible>;
</script>

<script lang="ts">
	let {
		open = $bindable(true),
		children,
		ref = $bindable(null),
		...restProps
	}: QueueSectionProps = $props();
</script>

<Collapsible bind:ref bind:open data-slot="queue-section" {...restProps}>
	{@render children?.()}
</Collapsible>
