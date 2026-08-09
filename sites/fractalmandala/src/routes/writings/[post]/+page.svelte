<script lang="ts">
	let { data } = $props();
	import { toc } from 'fractals-styler/lib';
	import { page } from '$app/state';

	let ref = $state<HTMLElement | null>(null);
	let current = $derived(page.url.pathname.split('/').filter(Boolean)[0]);

	// Publish this page's headings to the shared TOC store (rendered by the
	// layout's right rail) and wire scroll-spy. Re-runs when the post changes.
	$effect(() => {
		data;
		if (!ref) return;
		toc.setHeadings(ref);
		const stop = toc.observe(ref);
		return () => {
			stop();
			toc.clear();
		};
	});
</script>

<div class="box rgap32">
	<div class="box rgap8 header-panel">
		<h1 class="text-4xl fw600 lh11">{data.title}</h1>
		<p class="text-bs sec padbot8">{data.description}</p>
		{#if data.tags && data.tags.length > 0}
			<div class="row gap4 wrap">
				{#each data.tags as tag}
					<span class="pill text-xs tt-u fw500 ls-wide inverse">{tag.replaceAll('-', ' ')}</span>
				{/each}
			</div>
		{/if}
	</div>

	<div class="article-body" bind:this={ref}>
		<data.content />
	</div>

	{#if data.groupPosts && data.groupPosts.length > 0}
		<div class="box rgap16 padtop32" style="border-top: 1px solid var(--border-default)">
			<h2 class="text-2xl prim">Articles in this Group</h2>
			<div class="box rgap12">
				{#each data.groupPosts as post}
					<a class="box rgap4 bordered blank link" href={post.linkpath}>
						<span class="text-lg fw600 prim">{post.title}</span>
						{#if post.description}
							<span class="text-sm sec">{post.description}</span>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	{/if}

	{#if data.related && data.related.length > 0}
		<nav class="box rgap16" id="second-nav" aria-label="Also See">
			<span class="text-sm tt-c muted">Also See:</span>
			<div class="box rgap8">
				{#each data.related as related}
					<a class="text-md blank tt-c link" href="/{current}/{related}">
						<span class="sec">{related.replaceAll('-', ' ')}</span>
					</a>
				{/each}
			</div>
		</nav>
	{/if}
</div>
