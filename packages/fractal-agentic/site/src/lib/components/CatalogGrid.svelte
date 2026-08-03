<script lang="ts">
	import type { CatalogSummary } from '$lib/content';

	interface Props {
		items: CatalogSummary[];
		emptyMessage?: string;
	}

	let { items, emptyMessage = 'No entries match your filter.' }: Props = $props();
</script>

{#if items.length === 0}
	<p class="empty">{emptyMessage}</p>
{:else}
	<div class="catalog-grid">
		{#each items as item (item.href)}
			<article class="catalog-card">
				<span class="catalog-card__kind">{item.kind}</span>
				<a class="catalog-card__title" href={item.href}>{item.title}</a>
				<span class="catalog-card__desc">{@html item.descriptionHtml}</span>
				<span class="catalog-card__slug">{item.slug}</span>
			</article>
		{/each}
	</div>
{/if}
