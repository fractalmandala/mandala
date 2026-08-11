<script lang="ts">
	type Theme = 'light' | 'dark';

	type Props = {
		theme?: Theme;
		brand?: string;
		section?: string;
		title?: string;
		intro?: string;
		sections?: string[];
	};

	let {
		theme = 'light',
		brand = 'fractal mandala',
		section = 'Civilization / Orientation',
		title = 'The long view',
		intro = 'A starting point for reading culture as a living pattern rather than a fixed archive.',
		sections = ['A wider frame', 'The first question', 'Related notes']
	} = $props<Props>();
</script>

<svelte:head>
	<title>{title} · {brand}</title>
</svelte:head>

<div class={`theme-${theme} mandala-document`} data-theme={theme}>
	<header class="l-cluster mandala-nav">
		<a class="mandala-brand" href="/">{brand}</a>
		<nav class="l-cluster mandala-links" aria-label="Primary navigation">
			<a href="/">Index</a>
			<a href="/writings">Writings</a>
			<a href="/about">About</a>
		</nav>
		<div class="l-cluster mandala-tools">
			<input type="search" placeholder="Search knowledge" aria-label="Search knowledge" />
			<button class="u-icon-button" type="button" aria-label="Open menu">•••</button>
		</div>
	</header>

	<main class="l-sidebar mandala-document-layout">
		<aside class="mandala-document-nav" aria-label="On this page">
			<strong>On this page</strong>
			{#each sections as item, index}
				<a class:is-active={index === 0} href={`#section-${index + 1}`}>{item}</a>
			{/each}
		</aside>

		<article class="l-prose mandala-document-body">
			<div class="u-label">{section}</div>
			<h1>{title}</h1>
			<div class="l-cluster mandala-meta"><span>Updated today</span><span>8 min read</span></div>
			<p class="mandala-document-intro">{intro}</p>
			<p>Good documentation does not rush to the answer. It gives the reader a clear edge to stand on, then lets the next idea arrive with enough space around it.</p>
			<aside class="mandala-callout">A template should establish a dependable rhythm: orientation, substance, and a small invitation to continue.</aside>
			<h2 id="section-1">{sections[0]}</h2>
			<p>Start with the premise, name the vocabulary, and keep the page calm enough that the reader can build their own map.</p>
			<h2 id="section-2">{sections[1]}</h2>
			<p>The detail belongs here. Long-form content, examples, and references should feel like a natural deepening of the opening promise.</p>
		</article>

		<aside class="mandala-related">
			<strong>Next</strong>
			<a href="#section-3">{sections[2]}</a>
			<a href="/">Index overview</a>
			<a href="/edit">Edit this page</a>
		</aside>
	</main>
</div>
