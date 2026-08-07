<script lang="ts">
	import type { DocsNavigationNode } from '@docs-kit/core';

	import { findNavigationTrail } from './navigation-trail.js';

	let {
		navigation,
		pathname,
		label = 'Breadcrumb'
	}: { navigation: DocsNavigationNode[]; pathname: string; label?: string } = $props();

	const trail = $derived(findNavigationTrail(navigation, pathname));
</script>

{#if trail.length > 1}
	<nav class="docs-breadcrumbs" aria-label={label}>
		<ol>
			{#each trail as entry, index (entry.label + index)}
				<li>
					{#if entry.pathname && index < trail.length - 1}
						<a href={entry.pathname}>{entry.label}</a>
					{:else}
						<span aria-current={index === trail.length - 1 ? 'page' : undefined}>{entry.label}</span>
					{/if}
					{#if index < trail.length - 1}<span aria-hidden="true">/</span>{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}
