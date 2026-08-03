<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import type { Snippet } from 'svelte';
	import { ScrollArea } from '$lib/components/scroll-area/index.js';

	export type QueueListProps = Omit<ComponentProps<typeof ScrollArea>, 'children'> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		maxHeight = '10rem',
		...restProps
	}: QueueListProps = $props();
</script>

<ScrollArea bind:ref data-slot="queue-list" {maxHeight} {...restProps}>
	<div data-slot="queue-list-inner">
		<ul data-slot="queue-list-ul">
			{@render children?.()}
		</ul>
	</div>
</ScrollArea>
