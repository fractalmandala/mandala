<script lang="ts">
	type Theme = 'light' | 'dark';

	type Props = {
		theme?: Theme;
		brand?: string;
		logoSrc?: string;
		section?: string;
		title?: string;
		intro?: string;
		related?: string[];
	};

	let {
		theme = 'light',
		brand = 'fractaldesign / notes',
		logoSrc = '',
		section = 'Foundations / Typography',
		title = 'A generous measure',
		intro = 'The best reading surfaces give language enough room to reveal its structure.',
		related = ['The measure', 'Hierarchy', 'More to explore']
	} = $props<Props>();
</script>

<svelte:head>
	<title>{title} · {brand}</title>
</svelte:head>

<div class={`theme-${theme} design-document`} data-theme={theme}>
	<header class="l-cluster design-nav">
		<a class="design-brand" href="/">
			{#if logoSrc}<img src={logoSrc} alt={brand} />{:else}<span>{brand}</span>{/if}
		</a>
		<nav class="l-cluster design-links" aria-label="Primary navigation">
			<a href="/docs">Documentation</a>
			<a href="/notes">Notes</a>
			<a href="/playground">Playground</a>
		</nav>
		<div class="l-cluster design-tools">
			<input type="search" placeholder="Search notes" aria-label="Search notes" />
			<button class="u-icon-button" type="button" aria-label="Open menu">•••</button>
		</div>
	</header>

	<main class="l-sidebar design-document-layout">
		<div class="design-document-number" aria-hidden="true">02</div>
		<article class="l-prose design-document-body">
			<div class="u-label">{section}</div>
			<h1>{title}</h1>
			<div class="l-cluster design-meta"><span>Updated today</span><span>8 min read</span></div>
			<p class="design-document-intro">{intro}</p>
			<p>Good documentation gives language enough room to reveal its structure. The page should feel composed, but never precious: a clear invitation to look closer.</p>
			<aside class="design-callout">A generous measure is a design decision. It lets the reader keep their place.</aside>
			<h2 id="design-measure">{related[0]}</h2>
			<p>Start with the premise, name the vocabulary, and keep the page calm enough that the reader can build their own map.</p>
			<h2 id="design-hierarchy">{related[1]}</h2>
			<p>The detail belongs here. Long-form content, examples, and references should feel like a natural deepening of the opening promise.</p>
		</article>
		<aside class="design-related">
			<strong>Continue</strong>
			<a href="#design-measure">{related[0]}</a>
			<a href="#design-hierarchy">{related[1]}</a>
			<a href="/docs">{related[2]}</a>
		</aside>
	</main>
</div>
