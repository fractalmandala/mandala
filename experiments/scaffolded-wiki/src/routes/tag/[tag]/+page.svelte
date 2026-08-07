<script lang="ts">
	import TagChips from '$lib/components/TagChips.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const groups = $derived.by(() => {
		const map = new Map<string, typeof data.pages>();
		for (const p of data.pages) {
			const list = map.get(p.section) ?? [];
			list.push(p);
			map.set(p.section, list);
		}
		return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
	});
</script>

<svelte:head>
	<title>Tag: {data.tag} · Repowiki</title>
</svelte:head>

<div class="page-col">
	<header class="list-head">
		<h1># {data.tag}</h1>
		<p>{data.pages.length} doc{data.pages.length === 1 ? '' : 's'} carry this tag.</p>
	</header>

	{#each groups as [section, pages] (section)}
		<p class="section-title">{section}</p>
		<div class="result-list">
			{#each pages as page (page.path)}
				<a class="result-item" href={page.path}>
					{#if page.type}<span class="section-badge">{page.type}</span>{/if}
					<div class="r-title">{page.title}</div>
					{#if page.description}<p class="r-desc">{page.description}</p>{/if}
					{#if page.tags.length > 0}
						<div class="r-tags"><TagChips tags={page.tags} /></div>
					{/if}
				</a>
			{/each}
		</div>
	{/each}
</div>
