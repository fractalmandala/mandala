<script lang="ts">
	import { page } from '$app/state';
	let { data } = $props();
	import '$lib/styles/syntax-dark.css'

	let title = $derived(data.title);
	let current = $derived(page.url.pathname.replace(/^\//, ''));
	let currentId = $derived(data.id);
	let i = $derived(data.orderedPosts.findIndex((d) => d.meta.id === currentId));
	let prev = $derived(i > 0 ? data.orderedPosts[i - 1] : null);
	let next = $derived(
		i >= 0 && i < data.orderedPosts.length - 1 ? data.orderedPosts[i + 1] : null
	);

	let routeSegments = $derived(page.url.pathname.split('/').filter(Boolean));
	let firstSegment = $derived(routeSegments[0]);
</script>

<svelte:head>
	<title>{data.title} · Svelte Animated Icon</title>
	<meta name="description" content={data.description} />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://svelte-animated-icon.vercel.app{page.url.pathname}" />
	<meta property="og:title" content="{data.title} · Svelte Animated Icon" />
	<meta property="og:description" content={data.description} />
	<meta property="og:image" content="https://svelte-animated-icon.vercel.app/images/svelte-animated-icon.webp" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://svelte-animated-icon.vercel.app{page.url.pathname}" />
	<meta property="twitter:title" content="{data.title} · Svelte Animated Icon" />
	<meta property="twitter:description" content={data.description} />
	<meta property="twitter:image" content="https://svelte-animated-icon.vercel.app/images/svelte-animated-icon.webp" />
</svelte:head>

<section class="page-wrapper">
	<div class="content-container box gap32">
		<div class="doc-header">
			<div class="row breadcrumbs gap4 ycenter">
				<a href="/">{firstSegment}</a>
				<span class="tt-u">/ {data.group}</span>
			</div>
			<h1>{data.title}</h1>
			<p class="col2 text-md">{data.description}</p>
		</div>
		<article>
			<data.content />
		</article>
		<nav class="pagination row ycenter gap16">
			{#if prev}
				<a class="pagination-card box gap4" href={prev.linkpath}>
					<span class="text-sm">Previous</span>
					<span class="text-bs">{prev.meta.title}</span>
				</a>
			{:else}<span></span>{/if}
			{#if next}
				<a class="pagination-card box gap4" href={next.linkpath}>
					<span class="text-sm">Next</span>
					<span class="text-bs">{next.meta.title}</span>
				</a>
			{/if}
		</nav>
	</div>
</section>
