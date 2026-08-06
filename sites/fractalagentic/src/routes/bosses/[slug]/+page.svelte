<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.entry.title} | Bosses | fractalagentic</title>
	<meta name="description" content={data.entry.description} />
</svelte:head>

<article class="reference-page reference-page--boss">
	<header class="page-head">
		<p class="page-head__kicker">Executive routing / Boss playbook</p>
		<h1 class="page-head__title">{data.entry.title}</h1>
		<p class="page-head__desc">{data.entry.description}</p>
		<p class="page-head__meta"><a href="/bosses">All bosses</a></p>
	</header>

	<div class="prose">{@html data.html}</div>

	<style>
		:global(.prose) {
			max-width: 72ch;
		}
	</style>
</article>
