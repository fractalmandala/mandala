<script lang="ts">
	import type { Snippet } from 'svelte';

	type Related = { title?: string; description?: string; linkpath?: string };

	let {
		section = '',
		title = '',
		description = '',
		tags = [],
		related = [],
		groupPosts = [],
		children
	}: {
		section?: string;
		title?: string;
		description?: string;
		tags?: string[];
		related?: string[];
		groupPosts?: Related[];
		children: Snippet;
	} = $props();
</script>

<article class="mandala-document">
	<header class="mandala-document-header">
		<a class="mandala-document-back" href="/{section}">← {section.replaceAll('-', ' ')}</a>
		<p class="mandala-kicker">{section.replaceAll('-', ' ')} / document</p>
		<h1>{title}</h1>
		{#if description}<p class="mandala-document-description">{description}</p>{/if}
		{#if tags.length}
			<div class="mandala-document-tags">
				{#each tags as tag}<span>{tag.replaceAll('-', ' ')}</span>{/each}
			</div>
		{/if}
	</header>

	<div class="mandala-document-body">
		{@render children()}
	</div>

	{#if groupPosts.length}
		<section class="mandala-document-related">
			<p class="mandala-kicker">In this collection</p>
			{#each groupPosts as post}
				<a href={post.linkpath ?? '#'}>
					<strong>{post.title}</strong>
					{#if post.description}<span>{post.description}</span>{/if}
				</a>
			{/each}
		</section>
	{/if}

	{#if related.length}
		<nav class="mandala-document-related mandala-document-also" aria-label="Also see">
			<p class="mandala-kicker">Also see</p>
			{#each related as item}<a href="/{section}/{item}">{item.replaceAll('-', ' ')}</a>{/each}
		</nav>
	{/if}
</article>
