<script lang="ts">
	/**
	 * Design prototype (mock data). Production surface is app-organize.svelte.
	 * Tags & Categories: left column of terms with counts, results as rows.
	 * Bookmarks: no filter column, rows fill the width.
	 */
	let {
		items = [
			{ id: '1', title: 'Porting the sidebar', excerpt: 'Twenty-five files with several internal dependencies — status first…', category: 'Engineering', tag: 'porting', when: 'Today', bookmarked: true },
			{ id: '2', title: 'Menu-button tv() matrix', excerpt: 'Variants, defaults, and the compound cases that actually ship…', category: 'Engineering', tag: 'porting', when: 'Jul 29', bookmarked: false },
			{ id: '3', title: 'is-mobile hook, open questions', excerpt: 'Not in the lib yet; decide whether it comes over or gets rewritten…', category: 'Engineering', tag: 'porting', when: 'Jul 28', bookmarked: false },
			{ id: '4', title: 'Reading list, Q3', excerpt: 'Seeing Like a State, then the shorter ones to clear the backlog…', category: 'Personal', tag: 'reading', when: 'Jul 29', bookmarked: true },
			{ id: '5', title: 'Braise, no sear', excerpt: 'Lower and slower than the recipe says; salt the day before…', category: 'Personal', tag: 'recipes', when: 'Jul 21', bookmarked: true },
			{ id: '6', title: 'Kitchen rebuild', excerpt: 'Measure twice. The cabinet run is 40mm out at the far wall…', category: 'House', tag: 'kitchen', when: 'Jul 28', bookmarked: false }
		],
		tab = $bindable('tags'),
		selected = $bindable('porting'),
		onopen
	} = $props();

	const tabs = [
		{ id: 'tags', label: 'Tags' },
		{ id: 'bookmarks', label: 'Bookmarks' },
		{ id: 'categories', label: 'Categories' }
	];

	const key = $derived(tab === 'categories' ? 'category' : 'tag');

	const terms = $derived(
		tab === 'bookmarks'
			? []
			: [...items.reduce((m, i) => m.set(i[key], (m.get(i[key]) ?? 0) + 1), new Map())]
					.map(([name, count]) => ({ name, count }))
					.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
	);

	const results = $derived(
		tab === 'bookmarks' ? items.filter((i) => i.bookmarked) : items.filter((i) => i[key] === selected)
	);

	function pick(name: string) {
		selected = name;
	}

	$effect(() => {
		if (tab !== 'bookmarks' && terms.length && !terms.some((t) => t.name === selected)) {
			selected = terms[0].name;
		}
	});
</script>

<div class="app">
	<header class="tabs">
		{#each tabs as t}
			<button class="tab" class:on={tab === t.id} onclick={() => (tab = t.id)}>{t.label}</button>
		{/each}
	</header>

	<div class="main">
		{#if tab !== 'bookmarks'}
			<aside class="terms">
				{#each terms as term (term.name)}
					<button class="term" class:on={term.name === selected} onclick={() => pick(term.name)}>
						<span class="term-name">{term.name}</span>
						<span class="term-count">{term.count}</span>
					</button>
				{/each}
			</aside>
		{/if}

		<section class="results">
			<div class="caption">
				{tab === 'bookmarks' ? `${results.length} saved` : `${selected} · ${results.length} notes`}
			</div>
			<div class="rows">
				{#each results as item (item.id)}
					<button class="row" onclick={() => onopen?.(item)}>
						<span class="row-main">
							<span class="row-title">{item.title}</span>
							<span class="row-excerpt">{item.excerpt}</span>
						</span>
						<span class="row-cat">{item.category}</span>
						<span class="row-when">{item.when}</span>
					</button>
				{:else}
					<div class="empty">Nothing here yet</div>
				{/each}
			</div>
		</section>
	</div>

	<footer class="toolbar">
		<div class="group">
			<span class="dim">18px</span>
			<button class="link">Serif</button>
			<button class="link on">Sans</button>
			<button class="link">Mono</button>
		</div>
		<div class="group">
			<button class="link">Bookmarks</button>
			<button class="link">Tags</button>
			<button class="link">Categories</button>
			<button class="link on">New</button>
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: #fcfcfc;
		color: #171715;
		font-family: 'IBM Plex Sans', Helvetica, sans-serif;
	}

	.tabs {
		flex: none;
		display: flex;
		align-items: baseline;
		gap: 26px;
		padding: 34px 40px 30px;
	}
	.tab {
		border: 0;
		background: none;
		padding: 0;
		font: inherit;
		font-size: 15px;
		color: #a8a8a1;
		cursor: pointer;
	}
	.tab:hover {
		color: #6f6f69;
	}
	.tab.on {
		color: #131311;
		font-weight: 600;
	}

	.main {
		flex: 1;
		min-height: 0;
		display: flex;
		gap: 64px;
		padding: 0 40px;
		overflow: hidden;
	}

	.terms {
		width: 210px;
		flex: none;
		display: flex;
		flex-direction: column;
		gap: 13px;
		overflow: auto;
	}
	.term {
		border: 0;
		background: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		font-size: 14px;
	}
	.term-name {
		color: #8f8f88;
	}
	.term:hover .term-name {
		color: #4b4b45;
	}
	.term-count {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: #c1c1ba;
	}
	.term.on .term-name {
		color: #131311;
		font-weight: 600;
	}
	.term.on .term-count {
		color: #131311;
	}

	.results {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
	.caption {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #b4b4ad;
		margin-bottom: 22px;
	}
	.rows {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.row {
		border: 0;
		background: none;
		padding: 0;
		font: inherit;
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: baseline;
		gap: 20px;
	}
	.row-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.row-title {
		font-size: 15px;
		font-weight: 500;
		color: #171715;
	}
	.row-excerpt {
		font-size: 13px;
		color: #a5a59e;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.row-cat {
		width: 120px;
		flex: none;
		text-align: right;
		font-size: 12px;
		color: #b4b4ad;
	}
	.row-when {
		width: 62px;
		flex: none;
		text-align: right;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: #c1c1ba;
	}
	.empty {
		font-size: 13px;
		color: #c1c1ba;
	}

	.toolbar {
		flex: none;
		height: 52px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 40px;
		font-size: 12px;
	}
	.group {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.dim {
		color: #bcbcb5;
	}
	.link {
		border: 0;
		background: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		color: #bcbcb5;
	}
	.link:hover {
		color: #6f6f69;
	}
	.link.on {
		color: #131311;
	}
</style>
