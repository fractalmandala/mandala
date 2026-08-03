<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { CollapsibleContent } from '$lib/components/collapsible/index.js';

	export type TaskContentProps = ComponentProps<typeof CollapsibleContent>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: TaskContentProps = $props();
</script>

<!-- Own data-slot so task styles apply; height animation redeclared in task.sass -->
<CollapsibleContent bind:ref data-slot="task-content" {...restProps}>
	<div data-slot="task-content-inner">
		{@render children?.()}
	</div>
</CollapsibleContent>
