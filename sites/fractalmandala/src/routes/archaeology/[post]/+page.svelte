<script lang="ts">
	let { data } = $props();
	import { toc } from 'fractals-styler/lib';
	import { page } from '$app/state';
	import { sidebarExtras } from '$lib/state/sidebar-extras.svelte';

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

	// Push related links into the shared right-sidebar store.
	$effect(() => {
		if (data.related && data.related.length > 0) {
			sidebarExtras.alsoSee = data.related.map(r => ({
				href: `/${current}/${r}`,
				label: r.replaceAll('-', ' ')
			}));
		} else {
			sidebarExtras.alsoSee = [];
		}
		return () => {
			sidebarExtras.alsoSee = [];
		};
	});
</script>

<div class="box rgap32">
	<div class="box rgap8 header-panel">
		<a href="/archaeology" class="tt-u text-xs breadcrumb muted blank">archaeology</a>
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
</div>
