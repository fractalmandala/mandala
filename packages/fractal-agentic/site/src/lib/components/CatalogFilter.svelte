<script lang="ts">
	import type { CatalogSummary } from '$lib/content';
	import CatalogGrid from './CatalogGrid.svelte';

	interface Props {
		items: CatalogSummary[];
		placeholder?: string;
	}

	let { items, placeholder = 'Filter by name or description…' }: Props = $props();

	let query = $state('');

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.filter(
			(item) =>
				item.title.toLowerCase().includes(q) ||
				item.slug.toLowerCase().includes(q) ||
				item.description.toLowerCase().includes(q)
		);
	});
</script>

<div class="toolbar">
	<span class="toolbar__label" aria-hidden="true">Filter</span>
	<label class="visually-hidden" for="catalog-filter">Filter catalog</label>
	<input
		id="catalog-filter"
		class="search"
		type="search"
		bind:value={query}
		{placeholder}
		autocomplete="off"
	/>
</div>

<p class="page-head__meta">{filtered.length} shown · {items.length} total</p>

<CatalogGrid items={filtered} />
