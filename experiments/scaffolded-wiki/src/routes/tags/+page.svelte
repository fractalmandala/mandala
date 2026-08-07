<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Tags · Repowiki</title>
</svelte:head>

<div class="page-col">
	<header class="list-head">
		<h1>Tags</h1>
		<p>{data.tags.length} tags across the wiki — every tag links to the docs that carry it.</p>
	</header>

	<div style="display:flex;flex-wrap:wrap;gap:8px">
		{#each data.tags as t (t.slug)}
			<a class="chip tag-cloud" href={`/tag/${t.slug}`}>{t.tag}<span class="n">{t.count}</span></a>
		{/each}
	</div>
</div>
