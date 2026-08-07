<script lang="ts">
	import type { PageData } from './$types';
	import type { HomePageData } from '$lib/server/wiki';

	let { data }: { data: PageData & HomePageData } = $props();
</script>

<div class="page-col">
	<section class="hero">
		{#if data.landing}
			<p class="eyebrow">mandala monorepo · structured knowledge</p>
			<h1>{data.landing.title}</h1>
			<p class="lede">
				{data.landing.description || 'The repowiki — repo docs, project docs, and a knowledge wiki of cards and concepts, all generated from markdown.'}
			</p>
		{/if}

		<div class="stat-row">
			<div class="stat"><div class="n">{data.counts.docs}</div><div class="l">docs</div></div>
			<div class="stat"><div class="n">{data.counts.tags}</div><div class="l">tags</div></div>
			<div class="stat"><div class="n">{data.counts.sections}</div><div class="l">sections</div></div>
		</div>
	</section>

	<p class="section-title">Browse</p>
	<div class="card-grid">
		{#each data.sectionCards as card (card.path)}
			<a class="card" href={card.path}>
				<span class="c-title">{card.title}<span class="n">{card.count}</span></span>
				<p class="c-desc">{card.description || 'Browse this section.'}</p>
				<span class="c-go">Open →</span>
			</a>
		{/each}
	</div>

	{#if data.rootDocs.length > 0}
		<p class="section-title">Wiki meta</p>
		<div class="link-row">
			{#each data.rootDocs as doc (doc.path)}
				<a class="chip" href={doc.path}>{doc.title}</a>
			{/each}
		</div>
	{/if}

	<p class="section-title">Tag cloud</p>
	<div class="tag-cloud-row">
		{#each data.cloud as t (t.slug)}
			<a class="chip tag-cloud" href={`/tag/${t.slug}`}>{t.tag}<span class="n">{t.count}</span></a>
		{/each}
	</div>

	{#if data.mod}
		<p class="section-title">Index</p>
		<div class="index-box">
			<div class="md-body">
				<data.mod />
			</div>
		</div>
	{/if}
</div>
