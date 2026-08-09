<script lang="ts">
	import { onMount } from 'svelte';
	import FlexSearch from 'flexsearch';
	import type { SearchResult } from '$lib/search/search';
	import { highlight } from '$lib/search/search';

	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let loading = $state(true);
	let showDropdown = $state(false);
	let inputEl = $state<HTMLInputElement | undefined>(undefined);
	
	let index: any;
	const contentMap = new Map<string, string>();

	function escapeRegex(str: string) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function getExcerpt(text: string, searchTerm: string): string {
		if (!text) return '';
		const regex = new RegExp(escapeRegex(searchTerm), 'gi');
		const match = regex.exec(text);
		if (!match) return text.substring(0, 160) + '...';
		
		const start = Math.max(0, match.index - 40);
		const end = Math.min(text.length, match.index + 120);
		const excerpt = text.substring(start, end).trim();
		const prefix = start > 0 ? '…' : '';
		const suffix = end < text.length ? '…' : '';
		return `${prefix}${highlight(excerpt, searchTerm)}${suffix}`;
	}

	onMount(async () => {
		try {
			const res = await fetch('/search.json');
			const pages = (await res.json()) as SearchResult[];
			
			for (const page of pages) {
				contentMap.set(page.linkpath, page.description ?? '');
			}

			// @ts-ignore
			index = new FlexSearch.Document({
				document: {
					id: 'linkpath',
					index: [
						{ field: 'title', tokenize: 'forward' },
						{ field: 'description', tokenize: 'forward' }
					],
					store: ['title', 'description', 'linkpath', 'slug', 'bank', 'view', 'tags']
				}
			});

			for (const page of pages) {
				index.add(page);
			}
		} catch (error) {
			console.error('Failed to initialize search index:', error);
		} finally {
			loading = false;
		}
	});

	$effect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest('.search-container')) {
				showDropdown = false;
			}
		};
		window.addEventListener('click', handleClickOutside);
		return () => {
			window.removeEventListener('click', handleClickOutside);
		};
	});

	function runSearch(q: string) {
		if (!q.trim() || !index) {
			results = [];
			return;
		}
		
		const raw = index.search(q, { enrich: true, limit: 60 });
		const seen = new Set<string>();
		const titleMatchIds = new Set<string>();
		const deduped: SearchResult[] = [];
		
		for (const fieldResult of raw) {
			for (const item of fieldResult.result) {
				const id = item.id as string;
				if (fieldResult.field === 'title') {
					titleMatchIds.add(id);
				}
				if (!seen.has(id)) {
					seen.add(id);
					deduped.push(item.doc as SearchResult);
				}
			}
		}

		results = deduped.slice(0, 20).map((item) => {
			const highlightedTitle = highlight(item.title, q);
			let excerpt = '';
			if (!titleMatchIds.has(item.linkpath)) {
				excerpt = getExcerpt(contentMap.get(item.linkpath) ?? '', q);
			} else {
				excerpt = highlight(item.description || '', q);
			}
			return {
				...item,
				title: highlightedTitle,
				description: excerpt
			};
		});
	}

	let timer: ReturnType<typeof setTimeout>;
	$effect(() => {
		const q = query;
		clearTimeout(timer);
		if (q.trim()) {
			timer = setTimeout(() => runSearch(q), 180);
		} else {
			results = [];
		}
		return () => clearTimeout(timer);
	});
</script>

<div class="search-container">
	<div class="search-icon">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="11" cy="11" r="8"></circle>
			<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
		</svg>
	</div>
	<input
		bind:this={inputEl}
		bind:value={query}
		onfocus={() => showDropdown = true}
		placeholder={loading ? "Loading..." : "Search..."}
		disabled={loading}
		class="search-input"
		autocomplete="off"
		spellcheck="false"
		type="search"
	/>

	{#if showDropdown && query.trim().length > 0}
		<div class="results-dropdown" class:visible={query.trim().length > 0}>
			{#if results.length > 0}
				<ul>
					{#each results as result}
						<li>
							<a href={result.linkpath} onclick={() => { query = ''; showDropdown = false; }}>
								<div class="result-header">
									<span class="result-title">{@html result.title}</span>
									<span class="result-bank">{result.bank}</span>
								</div>
								{#if result.description}
									<p class="result-excerpt">{@html result.description}</p>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="search-empty ta-c sec text-sm">No results found for "{query}"</div>
			{/if}
		</div>
	{/if}
</div>