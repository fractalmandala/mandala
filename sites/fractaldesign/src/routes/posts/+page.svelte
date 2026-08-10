<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props();

	const tints = ['lav', 'mint', 'sky', 'amber', 'rose'];
</script>

<svelte:head>
	<title>Posts · Fractal Design</title>
	<meta name="description" content="Working notes on SvelteKit, design systems, and AI tooling." />
</svelte:head>

<header class="docs-pagehead">
	<span class="eyebrow">Posts // field notes</span>
	<h1 class="display docs-page-title">Notes from the bench</h1>
	<p class="docs-page-sub">
		Working notes on SvelteKit, design systems, and AI tooling — everything the
		playgrounds and components were built with.
	</p>
</header>

<div class="fd-grid">
	{#each data.posts as post, i (post.href)}
		<a class="fd-card" href={post.href}>
			<span class="row ycenter gap8">
				{#if post.meta.date}
					<span class="chip chip--{tints[i % 5]}">{post.meta.date}</span>
				{/if}
			</span>
			<span class="fd-card-title">{post.meta.title ?? post.href}</span>
			{#if post.meta.description}
				<span class="fd-card-desc">{post.meta.description}</span>
			{/if}
			{#if post.meta.tags && post.meta.tags.length}
				<span class="row gap6 wrap">
					{#each post.meta.tags as tag}
						<span class="chip">{tag}</span>
					{/each}
				</span>
			{/if}
		</a>
	{/each}
</div>
