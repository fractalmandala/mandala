<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getTabsContext } from './tabs-context.js';

	let { children, class: className }: { children: Snippet; class?: string } = $props();

	const tabs = getTabsContext();
</script>

<div role="tablist" data-slot="tabs-list" class={className}>
	{@render children()}
</div>
