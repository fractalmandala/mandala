<script lang="ts">
	import type { DocsHeading } from '@docs-kit/core';

	let {
		headings,
		label = 'On this page',
		minDepth = 2,
		maxDepth = 3
	}: { headings: DocsHeading[]; label?: string; minDepth?: number; maxDepth?: number } = $props();

	const entries = $derived(
		headings.filter((heading) => heading.depth >= minDepth && heading.depth <= maxDepth)
	);
</script>

{#if entries.length > 0}
	<nav class="docs-toc" aria-label={label}>
		<p class="docs-toc__title">{label}</p>
		<ol>
			{#each entries as heading (heading.id)}
				<li data-depth={heading.depth}>
					<a href="#{heading.id}">{heading.text}</a>
				</li>
			{/each}
		</ol>
	</nav>
{/if}
