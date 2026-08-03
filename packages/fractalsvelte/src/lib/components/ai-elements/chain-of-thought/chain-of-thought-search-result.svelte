<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Badge } from '$lib/components/badge/index.js';

	export type ChainOfThoughtSearchResultProps = ComponentProps<typeof Badge>;
</script>

<script lang="ts">
	// Keep data-slot="badge" so badge.sass applies; group chrome via parent + data attribute.
	let {
		children,
		variant = 'secondary',
		ref = $bindable(null),
		...restProps
	}: ChainOfThoughtSearchResultProps = $props();
</script>

<Badge
	bind:ref
	{variant}
	data-chain-search-result="true"
	{...restProps}
>
	{@render children?.()}
</Badge>
