<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.title} · fractalmem docs</title>
	<meta name="description" content={data.description} />
</svelte:head>

<article class="docs-typography">
	<header class="box gap8" style="margin-bottom: 32px">
		<h1>{data.title}</h1>
		<p class="text-lg col2" style="margin-top: 0">{data.description}</p>
	</header>
	<data.content />
</article>
