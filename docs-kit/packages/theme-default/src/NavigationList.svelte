<script lang="ts">
	import type { DocsNavigationNode } from '@docs-kit/core';

	import NavigationSection from './NavigationSection.svelte';
	import Self from './NavigationList.svelte';

	let {
		nodes,
		pathname
	}: { nodes: DocsNavigationNode[]; pathname: string } = $props();
</script>

<ul class="docs-nav-list">
	{#each nodes as node (node.id)}
		<li>
			{#if node.type === 'link'}
				<a
					class="docs-nav-link"
					href={node.href}
					rel={node.external ? 'noreferrer' : undefined}
					target={node.external ? '_blank' : undefined}
				>
					{node.label}{#if node.external}<span aria-hidden="true"> ↗</span>{/if}
				</a>
			{:else if node.type === 'page'}
				<a
					class="docs-nav-link"
					href={node.pathname}
					aria-current={node.pathname === pathname ? 'page' : undefined}
				>
					{node.label}
					{#if node.badge}<span class="docs-badge docs-badge--accent">{node.badge}</span>{/if}
				</a>
				{#if node.children && node.children.length > 0}
					<Self nodes={node.children} {pathname} />
				{/if}
			{:else}
				<NavigationSection {node} {pathname}>
					{#snippet children(childNodes)}
						<Self nodes={childNodes} {pathname} />
					{/snippet}
				</NavigationSection>
			{/if}
		</li>
	{/each}
</ul>
