<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { CollapsibleContent } from '$lib/components/collapsible/index.js';

	export type ChainOfThoughtContentProps = ComponentProps<typeof CollapsibleContent>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ChainOfThoughtContentProps = $props();
</script>

<!-- Own data-slot so CoT styles apply; height animation redeclared in chain-of-thought.sass -->
<CollapsibleContent bind:ref data-slot="chain-of-thought-content" {...restProps}>
	{@render children?.()}
</CollapsibleContent>
