<script lang="ts">
	import { page } from '$app/state';
	import { byCategory } from './registry.js';
	import { aiByCategory } from './ai-registry.js';
	import { blocksByCategory } from './blocks-registry.js';

	export type DocsSection = 'components' | 'ai' | 'blocks';

	let {
		section,
		onnavigate
	}: {
		section: DocsSection;
		onnavigate?: () => void;
	} = $props();

	const groups = $derived(
		section === 'ai'
			? aiByCategory()
			: section === 'blocks'
				? blocksByCategory()
				: byCategory()
	);
	const base = $derived(
		section === 'ai' ? '/ai' : section === 'blocks' ? '/blocks' : '/components'
	);
	const current = $derived(page.params.slug);
	const label = $derived(
		section === 'ai' ? 'AI Elements' : section === 'blocks' ? 'Blocks' : 'Components'
	);
</script>

<nav class="doc-sidebar-nav" aria-label={label}>
	{#each groups as group (group.category)}
		<section class="doc-sidebar-group">
			<h2 class="doc-sidebar-heading">{group.category}</h2>
			<ul class="doc-sidebar-list">
				{#each group.items as item (item.slug)}
					{#if item.status === 'ready'}
						<li>
							<a
								href="{base}/{item.slug}"
								class="sidebar-link"
								class:active={current === item.slug}
								data-active={current === item.slug}
								aria-current={current === item.slug ? 'page' : undefined}
								onclick={onnavigate}
							>
								{item.name}
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		</section>
	{/each}
</nav>
