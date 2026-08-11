<script lang="ts">
	import type { DocsPagerLink } from './types.js';

	type Props = {
		previous: DocsPagerLink;
		next: DocsPagerLink;
		label?: string;
	};

	let { previous, next, label = 'Page navigation' }: Props = $props();
</script>

<nav class="acrolls-docs-pager" aria-label={label}>
	{#if previous}
		<a class="acrolls-docs-pager__link acrolls-docs-pager__link--prev" href={previous.href}>
			<span class="acrolls-docs-pager__dir">← Previous</span>
			<span class="acrolls-docs-pager__title">{previous.title}</span>
		</a>
	{:else}
		<span class="acrolls-docs-pager__spacer"></span>
	{/if}
	{#if next}
		<a class="acrolls-docs-pager__link acrolls-docs-pager__link--next" href={next.href}>
			<span class="acrolls-docs-pager__dir">Next →</span>
			<span class="acrolls-docs-pager__title">{next.title}</span>
		</a>
	{:else}
		<span class="acrolls-docs-pager__spacer"></span>
	{/if}
</nav>
