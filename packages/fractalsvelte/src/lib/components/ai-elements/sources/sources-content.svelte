<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { CollapsibleContent } from '$lib/components/collapsible/index.js';

	export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: SourcesContentProps = $props();
</script>

<!-- Own data-slot so sources styles apply; height animation redeclared in sources.sass -->
<CollapsibleContent bind:ref data-slot="sources-content" {...restProps}>
	{@render children?.()}
</CollapsibleContent>
