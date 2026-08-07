<script lang="ts">
	import { getContext, type Snippet } from 'svelte';

	import { tabsContextKey, type TabsContext } from './tabs-context.js';

	let { label, children }: { label: string; children: Snippet } = $props();

	const context = getContext<TabsContext | undefined>(tabsContextKey);
	const selected = $derived(context === undefined || context.active === label);
</script>

{#if selected}
	<div class="docs-tabs__panel" role="tabpanel" id="panel-{label}" aria-labelledby="tab-{label}">
		{@render children()}
	</div>
{/if}
