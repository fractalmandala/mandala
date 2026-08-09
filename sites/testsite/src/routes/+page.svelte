<script lang="ts">
	let { data } = $props();

	let total = $derived(data.collections.reduce((n, c) => n + c.count, 0));
	const badges = { posts: 'posts', sveltemotion: 'svelte-motion' };
</script>

<svelte:head>
	<title>fractaldesign · docs</title>
</svelte:head>

<section class="home-hero">
	<div class="page-kicker">
		<span>fractaldesign</span>
		<span class="sep">/</span>
		<span>Docs index</span>
	</div>
	<h1>Markdown docs, straight from folders.</h1>
	<p class="lead">
		{total} documents across two collections, served directly from their original folders — no
		renaming, no per-file routes.
	</p>
	<div class="home-actions">
		<a class="btn btn-primary" href="/posts">Browse posts</a>
		<a class="btn btn-secondary" href="/sveltemotion">Browse SvelteMotion</a>
	</div>
</section>

<section>
	<div class="card-grid">
		{#each data.collections as collection (collection.name)}
			<a class="nav-card" href={`/${collection.name}`}>
				<div class="card-ico">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
						<path d="M4 6h16M4 12h10M4 18h16" />
					</svg>
				</div>
				<h3>{collection.label} · {collection.count}</h3>
				<p>
					{collection.name === 'posts'
						? 'SvelteKit tutorials and notes — auth, stores, modals, SEO and more.'
						: 'Svelte Motion API docs — hooks, motion values, gestures and variants.'}
				</p>
			</a>
		{/each}
	</div>
</section>

{#if data.recent.length}
	<section>
		<div class="section-title">
			<h2>Recent writing</h2>
			<a class="btn btn-ghost" href="/posts">View all</a>
		</div>
		{#each data.recent as doc (doc.collection + doc.slug)}
			<a class="log-row" href={`/${doc.collection}/${doc.slug}`}>
				<span class="meta">{doc.date?.slice(5) ?? '—'}</span>
				<div>
					<h3>{doc.title}</h3>
					{#if doc.description}<p>{doc.description}</p>{/if}
				</div>
				<span class="meta">{badges[doc.collection as 'posts' | 'sveltemotion']}</span>
			</a>
		{/each}
	</section>
{/if}
