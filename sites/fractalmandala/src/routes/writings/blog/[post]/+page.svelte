+<script lang="ts">
	import { page } from '$app/state';
	import { toc } from 'fractals-styler/lib';
	import MandalaDocumentTemplate from '$lib/templates/MandalaDocumentTemplate.svelte';

	let { data } = $props();
	let ref = $state<HTMLElement | null>(null);
	let current = $derived(page.url.pathname.split('/').filter(Boolean)[0]);

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

<MandalaDocumentTemplate section={current} title={data.title} description={data.description} tags={data.tags} related={data.related}>
	<div class="article-body" bind:this={ref}>
		<data.content />
	</div>
</MandalaDocumentTemplate>
