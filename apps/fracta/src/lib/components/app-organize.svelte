<script lang="ts">
	import { bookmarks } from '$lib/state/bookmarks.svelte';
	import { entries } from '$lib/state/entries.svelte';
	import { knowledge, type LibraryItem } from '$lib/state/knowledge.svelte';
	import { ui, type OrganizeTab } from '$lib/state/ui.svelte';

	let selected = $state('');

	const tabs: { id: OrganizeTab; label: string }[] = [
		{ id: 'tags', label: 'Tags' },
		{ id: 'bookmarks', label: 'Bookmarks' },
		{ id: 'categories', label: 'Categories' }
	];

	const terms = $derived(
		ui.organizeTab === 'tags'
			? knowledge.tagTerms
			: ui.organizeTab === 'categories'
				? knowledge.categoryTerms
				: []
	);

	const results = $derived.by((): LibraryItem[] => {
		if (ui.organizeTab === 'bookmarks') return knowledge.bookmarked;
		if (!selected) return [];
		if (ui.organizeTab === 'tags') {
			return knowledge.items.filter((i) => i.tags.includes(selected));
		}
		return knowledge.items.filter((i) => i.category === selected);
	});

	const caption = $derived(
		ui.organizeTab === 'bookmarks'
			? `${results.length} saved`
			: selected
				? `${selected} · ${results.length} notes`
				: 'Pick a term'
	);

	$effect(() => {
		if (ui.organizeTab === 'bookmarks') return;
		if (terms.length && !terms.some((t) => t.name === selected)) {
			selected = terms[0]?.name ?? '';
		}
		if (!terms.length) selected = '';
	});

	function pickTab(tab: OrganizeTab) {
		ui.setOrganizeTab(tab);
	}

	function pickTerm(name: string) {
		selected = name;
	}

	async function openItem(item: LibraryItem) {
		ui.setMode('capture');
		await entries.open(item.id);
	}
</script>

<div class="organize">
	<header class="organize__tabs row gap24">
		{#each tabs as tab (tab.id)}
			<button
				type="button"
				class="organize__tab"
				class:organize__tab--on={ui.organizeTab === tab.id}
				onclick={() => pickTab(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</header>

	<div class="organize__main" class:organize__main--wide={ui.organizeTab === 'bookmarks'}>
		{#if ui.organizeTab !== 'bookmarks'}
			<aside class="organize__terms">
				{#each terms as term (term.name)}
					<button
						type="button"
						class="organize__term"
						class:organize__term--on={term.name === selected}
						onclick={() => pickTerm(term.name)}
					>
						<span class="organize__term-name">{term.name}</span>
						<span class="organize__term-count">{term.count}</span>
					</button>
				{:else}
					<p class="organize__empty">
						{ui.organizeTab === 'tags'
							? 'No tags yet. Add some from the note metadata strip.'
							: 'No categories yet. Set one while editing a note.'}
					</p>
				{/each}
			</aside>
		{/if}

		<section class="organize__results">
			<div class="organize__caption">{caption}</div>
			<div class="organize__rows">
				{#each results as item (item.id)}
					<button type="button" class="organize__row" onclick={() => openItem(item)}>
						<span class="organize__row-main">
							<span class="organize__row-title">
								{item.title}
								{#if item.bookmarked || bookmarks.isBookmarked(item.id)}
									<span class="organize__pin" aria-hidden="true">●</span>
								{/if}
							</span>
							{#if item.excerpt}
								<span class="organize__row-excerpt">{item.excerpt}</span>
							{/if}
						</span>
						{#if item.category}
							<span class="organize__row-cat">{item.category}</span>
						{/if}
						<span class="organize__row-when">{item.when}</span>
					</button>
				{:else}
					<div class="organize__empty">Nothing here yet</div>
				{/each}
			</div>
		</section>
	</div>
</div>
