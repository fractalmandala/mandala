<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.entry.title} | Workflows | fractalagentic</title>
	<meta name="description" content={data.entry.description} />
</svelte:head>

<div class="site-container padtop32 padbot64">
	<article class="reference-page reference-page--workflow">
		<header class="page-head">
			<p class="page-head__kicker">Playbook / Workflow</p>
			<h1 class="page-head__title">{data.entry.title}</h1>
			<p class="page-head__desc">{data.entry.description}</p>
			<p class="page-head__meta"><a href="/workflows">All workflows</a></p>
		</header>

		<div class="prose">
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html data.html}
			<!-- eslint-enable svelte/no-at-html-tags -->
		</div>
	</article>
</div>
