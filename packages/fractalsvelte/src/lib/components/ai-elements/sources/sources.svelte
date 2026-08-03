<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Collapsible } from '$lib/components/collapsible/index.js';

	export type SourcesProps = ComponentProps<typeof Collapsible>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: SourcesProps = $props();
</script>

<Collapsible bind:ref data-slot="sources" {...restProps}>
	{@render children?.()}
</Collapsible>
