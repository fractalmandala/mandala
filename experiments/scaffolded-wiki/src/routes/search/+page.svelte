<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Search params are read in an $effect — it never runs during prerender
	// (where accessing url.searchParams is forbidden), and it keeps the query
	// in sync with browser back/forward.
	let q = $state('');
	let inputRef = $state<HTMLInputElement | null>(null);

	$effect(() => {
		q = page.url.searchParams.get('q') ?? '';
	});

	$effect(() => {
		if (inputRef) inputRef.focus();
	});

	const needle = $derived(q.trim().toLowerCase());

	const results = $derived.by(() => {
		if (!needle) return [];
		const terms = needle.split(/\s+/).filter(Boolean);
		return data.index.filter((d) => {
			const hay = `${d.title} ${d.description} ${d.section} ${d.path} ${d.tags.join(' ')}`.toLowerCase();
			return terms.every((t) => hay.includes(t));
		});
	});
</script>

<svelte:head>
	<title>Search · Repowiki</title>
</svelte:head>

<div class="page-col">
	<header class="list-head">
		<h1>Search</h1>
		<p>{data.index.length} docs in the index — type to filter across titles, descriptions, tags and paths.</p>
	</header>

	<div class="search-box">
		<input
			bind:this={inputRef}
			type="search"
			placeholder="Search docs, cards, concepts…"
			aria-label="Search docs"
			bind:value={q}
		/>
	</div>

	{#if !needle}
		<p style="color:var(--ink-3);font-size:0.88rem">
			Type a query above — results update as you type. The whole wiki is searchable, including cards and concepts.
		</p>
	{:else if results.length === 0}
		<p style="color:var(--ink-3);font-size:0.88rem">No docs match “{q}”.</p>
	{:else}
		<p style="font-family:var(--font-mono);font-size:0.75rem;color:var(--ink-3);margin:0 0 10px">
			{results.length} result{results.length === 1 ? '' : 's'}
		</p>
		<div class="result-list">
			{#each results as page (page.path)}
				<a class="result-item" href={page.path}>
					<div class="r-path">/{page.path}</div>
					<div class="r-title">{page.title}</div>
					{#if page.description}<p class="r-desc">{page.description}</p>{/if}
					{#if page.tags.length > 0}
						<div class="r-tags">
							{#each page.tags as tag (tag)}
								<span class="chip" style="cursor:default">{tag}</span>
							{/each}
						</div>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</div>
