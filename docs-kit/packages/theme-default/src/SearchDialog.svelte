<script lang="ts">
	import {
		createRecentSearches,
		groupSearchResults,
		highlightMatches,
		type DocsSearchClient,
		type DocsSearchResult
	} from '@docs-kit/search';

	let {
		client,
		label = 'Search documentation',
		placeholder = 'Search…',
		limit = 8,
		recentLimit = 5,
		open = $bindable(false)
	}: {
		/** Resolved lazily so the search provider is not in the initial bundle. */
		client: () => Promise<DocsSearchClient>;
		label?: string;
		placeholder?: string;
		limit?: number;
		/** How many past queries to remember. Set to 0 to disable the history. */
		recentLimit?: number;
		open?: boolean;
	} = $props();

	// The store is created lazily so the prop is read when it is used, not at setup time.
	const history = $derived(createRecentSearches({ limit: Math.max(recentLimit, 1) }));

	let dialog = $state<HTMLDialogElement>();
	let query = $state('');
	let results = $state<DocsSearchResult[]>([]);
	let recent = $state<string[]>([]);
	let status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
	let active = $state(0);
	let searchClient: DocsSearchClient | undefined;
	let requestId = 0;

	const groups = $derived(groupSearchResults(results));
	/** Flattened order the arrow keys walk, matching what is rendered. */
	const flat = $derived(groups.flatMap((group) => group.results));

	$effect(() => {
		if (!dialog) {
			return;
		}
		if (open && !dialog.open) {
			recent = recentLimit > 0 ? history.list() : [];
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	async function run(nextQuery: string) {
		query = nextQuery;
		active = 0;

		if (nextQuery.trim() === '') {
			results = [];
			status = 'idle';
			return;
		}

		const current = ++requestId;
		status = 'loading';

		try {
			searchClient ??= await client();
			const found = await searchClient.search(nextQuery, { limit });
			// A slower earlier query must not overwrite newer results.
			if (current === requestId) {
				results = found;
				status = 'ready';
			}
		} catch {
			if (current === requestId) {
				results = [];
				status = 'error';
			}
		}
	}

	function visit(result: DocsSearchResult) {
		if (recentLimit > 0) {
			recent = history.add(query);
		}
		open = false;
		window.location.assign(result.record.pathname);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const offset = event.key === 'ArrowDown' ? 1 : -1;
			active = flat.length === 0 ? 0 : (active + offset + flat.length) % flat.length;
			return;
		}

		const selected = flat[active];
		if (event.key === 'Enter' && selected) {
			event.preventDefault();
			visit(selected);
		}
	}
</script>

<svelte:window
	onkeydown={(event) => {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			open = true;
		}
	}}
/>

<dialog
	class="docs-search"
	bind:this={dialog}
	aria-label={label}
	onclose={() => (open = false)}
	onclick={(event) => {
		if (event.target === dialog) {
			open = false;
		}
	}}
>
	<div class="docs-search__panel">
		<!-- svelte-ignore a11y_autofocus -->
		<input
			class="docs-search__input"
			type="search"
			autofocus
			aria-label={label}
			aria-controls="docs-search-results"
			{placeholder}
			value={query}
			oninput={(event) => run(event.currentTarget.value)}
			{onkeydown}
		/>

		<p class="docs-search__status" role="status" aria-live="polite">
			{#if status === 'loading'}
				Searching…
			{:else if status === 'error'}
				Search is unavailable right now.
			{:else if status === 'ready'}
				{flat.length} result{flat.length === 1 ? '' : 's'}
			{:else}
				Type to search.
			{/if}
		</p>

		{#if status === 'idle' && recent.length > 0}
			<div class="docs-search__recent">
				<div class="docs-search__recent-head">
					<span class="docs-search__group-title">Recent searches</span>
					<button
						type="button"
						class="docs-search__clear"
						onclick={() => {
							history.clear();
							recent = [];
						}}
					>
						Clear
					</button>
				</div>
				<ul>
					{#each recent as entry (entry)}
						<li>
							<button type="button" class="docs-search__recent-item" onclick={() => run(entry)}>
								{entry}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div id="docs-search-results" role="listbox" aria-label={label}>
			{#each groups as group (group.pageId)}
				<div class="docs-search__group" role="group" aria-label={group.title}>
					<p class="docs-search__group-title">{group.title}</p>
					<ul>
						{#each group.results as result (result.record.id)}
							{@const index = flat.indexOf(result)}
							<li role="option" aria-selected={index === active}>
								<a
									class="docs-search__result"
									class:docs-search__result--active={index === active}
									href={result.record.pathname}
									onclick={() => visit(result)}
								>
									<span class="docs-search__result-title">
										{result.record.section ?? result.record.title}
									</span>
									{#if result.excerpt}
										<span class="docs-search__result-excerpt">
											{#each highlightMatches(result.excerpt, query) as segment, position (position)}
												{#if segment.match}<mark>{segment.text}</mark>{:else}{segment.text}{/if}
											{/each}
										</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</dialog>
