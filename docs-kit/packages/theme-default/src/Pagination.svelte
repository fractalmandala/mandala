<script lang="ts">
	import type { DocsPageReference } from '@docs-kit/core';

	let {
		previous,
		next,
		label = 'Pagination'
	}: {
		previous?: DocsPageReference | undefined;
		next?: DocsPageReference | undefined;
		label?: string;
	} = $props();
</script>

{#if previous || next}
	<nav class="docs-pagination" aria-label={label}>
		{#if previous}
			<a class="docs-pagination__link docs-pagination__link--previous" href={previous.pathname}>
				<span class="docs-pagination__direction">Previous</span>
				<span>{previous.label}</span>
			</a>
		{/if}
		{#if next}
			<a class="docs-pagination__link docs-pagination__link--next" href={next.pathname}>
				<span class="docs-pagination__direction">Next</span>
				<span>{next.label}</span>
			</a>
		{/if}
	</nav>
{/if}
