<script lang="ts">
	import CreditAttribution from '$lib/components/CreditAttribution.svelte';
	import MarkdownBody from '$lib/components/MarkdownBody.svelte';
	import PrevNext from '$lib/components/PrevNext.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.entry.title} · Command · Fractal Agentic</title>
	<meta name="description" content={data.entry.description} />
</svelte:head>

<div class="reference-page reference-page--detail reference-page--command-detail">
	<article class="doc-article">
		<header class="detail-head">
			<nav class="detail-head__crumbs" aria-label="Breadcrumb">
				<a href="/">Home</a>
				<span aria-hidden="true">/</span>
				<a href="/commands">Commands</a>
				<span aria-hidden="true">/</span>
				<span>{data.entry.slug}</span>
			</nav>
			<span class="detail-head__kind">command</span>
			<CreditAttribution credit={data.credit} />
		</header>

		<MarkdownBody html={data.html} />
		<PrevNext nav={data.pager} kindLabel="command" />
	</article>
</div>
