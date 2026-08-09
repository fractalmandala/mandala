<script lang="ts">
	let { data } = $props();

	let tags = $derived(Array.isArray(data.meta.tags) ? (data.meta.tags as string[]) : []);
</script>

<svelte:head>
	<title>{data.title} · fractaldesign docs</title>
	<meta name="description" content={data.meta.description ?? ''} />
</svelte:head>

<header class="page-header">
	<div class="page-kicker">
		<span>fractaldesign</span>
		<span class="sep">/</span>
		<span>{data.collection === 'posts' ? 'Posts' : 'SvelteMotion'}</span>
		<span class="sep">/</span>
		<span>{data.slug}</span>
	</div>
	<h1>{data.title}</h1>
	{#if data.meta.description}<p class="lead">{data.meta.description}</p>{/if}
	<div class="page-meta">
		{#if data.meta.date}<span>{data.meta.date}</span>{/if}
		{#if tags.length}
			<span>·</span>
			<span>{tags.join(' · ')}</span>
		{/if}
		{#if data.hasComponents}<span class="pill">MDX</span>{/if}
	</div>
</header>

{#if data.hasComponents}
	<div class="callout" style="margin-bottom: 24px;">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
			<circle cx="12" cy="12" r="9" />
			<path d="M12 8v5M12 16h.01" />
		</svg>
		<div>
			<strong>Imported MDX.</strong> This file came from another project's docs and embeds live
			Svelte components (<code>Example</code>, <code>Tabs</code>, …). Its prose is rendered here;
			interactive demos need the source project's component tree.
		</div>
	</div>
{/if}

<article class="prose">{@html data.html}</article>

<nav class="doc-nav" aria-label="Document navigation">
	{#if data.prev}
		<a href={`/${data.collection}/${data.prev.slug}`}>
			<span class="doc-nav-label">← Previous</span>
			<span class="doc-nav-title">{data.prev.title}</span>
		</a>
	{:else}
		<span aria-hidden="true"></span>
	{/if}
	{#if data.next}
		<a class="next" href={`/${data.collection}/${data.next.slug}`}>
			<span class="doc-nav-label">Next →</span>
			<span class="doc-nav-title">{data.next.title}</span>
		</a>
	{/if}
</nav>
