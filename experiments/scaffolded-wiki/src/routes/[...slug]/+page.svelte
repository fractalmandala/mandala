<script lang="ts">
	import Toc from '$lib/components/Toc.svelte';
	import TagChips from '$lib/components/TagChips.svelte';
	import DocPager from '$lib/components/DocPager.svelte';
	import type { Component } from 'svelte';
	import type { CatchAllPageData } from '$lib/server/wiki';

	/** Union of both loads: server view + the universal `mod` component. */
	interface ViewData extends CatchAllPageData {
		mod?: Component;
	}

	let { data }: { data: ViewData } = $props();

	let bodyRef = $state<HTMLElement | null>(null);

	const crumbs = $derived([{ label: 'Home', href: '/' }, ...(data.breadcrumbs ?? [])]);

	const title = $derived(data.landing?.title ?? data.page?.title ?? 'Repowiki');
	const description = $derived(data.landing?.description ?? data.page?.description);
</script>

<svelte:head>
	<title>{title} · Repowiki</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

<div class="doc-grid">
	<article>
		<nav class="crumbs" aria-label="Breadcrumb">
			{#each crumbs as crumb, i (i)}
				{#if i > 0}<span class="sep" aria-hidden="true">›</span>{/if}
				{#if i < crumbs.length - 1}
					<a href={crumb.href}>{crumb.label}</a>
				{:else}
					<span class="here">{crumb.label}</span>
				{/if}
			{/each}
		</nav>

		<header class="doc-header">
			<h1>{title}</h1>
			{#if description}
				<p class="doc-desc">{description}</p>
			{/if}
			{#if !data.landing && data.page.tags.length > 0}
				<TagChips tags={data.page.tags} />
			{/if}
			{#if data.meta.type || data.meta.module || data.meta.source || data.meta.updated}
				<div class="doc-meta-strip">
					{#if data.meta.type}<span class="meta-tag"><b>{data.meta.type}</b></span>{/if}
					{#if data.meta.module}<span class="meta-tag">module <b>{data.meta.module}</b></span>{/if}
					{#if data.meta.source}<span class="meta-tag">source <b>{data.meta.source}</b></span>{/if}
					{#if data.meta.updated}<span class="meta-tag">updated <b>{data.meta.updated}</b></span>{/if}
				</div>
			{/if}
		</header>

		{#if data.landing}
			<section class="section-landing" aria-label="Section contents">
				<p class="landing-desc">{data.landing.description}</p>
				<ul class="landing-list">
					{#each data.landing.children as child (child.path)}
						<li>
							<a class="landing-link" href={child.path}>{child.title}</a>
							{#if child.description}<p class="landing-sub">{child.description}</p>{/if}
						</li>
					{/each}
				</ul>
				{#if data.landing.tags.length > 0}
					<p class="section-title" style="margin:0 0 12px">Tags in this section</p>
					<div style="display:flex;flex-wrap:wrap;gap:7px">
						{#each data.landing.tags as t (t.slug)}
							<a class="chip" href={`/tag/${t.slug}`}>{t.tag}<span class="n">{t.count}</span></a>
						{/each}
					</div>
				{/if}
			</section>
		{:else}
			<div class="md-body" bind:this={bodyRef}>
				<data.mod />
			</div>
		{/if}

		{#if data.sectionTags.length > 0}
			<section aria-label="Tags in this section" style="margin-top:44px">
				<p class="section-title" style="margin:0 0 12px">Tags in {title}</p>
				<div style="display:flex;flex-wrap:wrap;gap:7px">
					{#each data.sectionTags as t (t.slug)}
						<a class="chip" href={`/tag/${t.slug}`}>{t.tag}<span class="n">{t.count}</span></a>
					{/each}
				</div>
			</section>
		{/if}

		{#if !data.landing}
			<DocPager prev={data.prev} next={data.next} />
		{/if}
	</article>

	{#if !data.landing}
		<Toc bodyRef={bodyRef} resetKey={data.path} />
	{/if}
</div>
