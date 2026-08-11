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
		brand = 'fractal_agentic / armory',
		section = 'Bosses / Svelte',
		title = 'Svelte boss',
		intro = 'A focused operating guide for building SvelteKit interfaces with clarity, speed, and a clean handoff.',
		sections = ['Mission', 'Operating rules', 'Related skills']
	} = $props<Props>();
</script>

<svelte:head>
	<title>{title} · {brand}</title>
</svelte:head>

<div class={`theme-${theme} agentic-document`} data-theme={theme}>
	<header class="l-cluster agentic-nav">
		<a class="agentic-brand" href="/">{brand}</a>
		<nav class="l-cluster agentic-links" aria-label="Primary navigation">
			<a href="/docs">Documentation</a>
			<a href="/docs/bosses">Bosses</a>
			<a href="/about">About</a>
		</nav>
		<div class="l-cluster agentic-tools">
			<input type="search" placeholder="Search armory" aria-label="Search armory" />
			<button class="u-icon-button" type="button" aria-label="Open menu">•••</button>
		</div>
	</header>

	<main>
		<header class="l-switcher agentic-document-heading">
			<div><div class="u-label">{section}</div><h1>{title}</h1></div>
			<p>{intro}</p>
		</header>
		<div class="l-sidebar agentic-document-layout">
			<aside class="agentic-document-nav" aria-label="On this page">
				<strong>On this page</strong>
				{#each sections as item, index}
					<a class:is-active={index === 0} href={`#section-${index + 1}`}>{item}</a>
				{/each}
			</aside>
			<article class="l-prose agentic-document-body">
				<div class="l-cluster agentic-meta"><span>Updated today</span><span>8 min read</span></div>
				<p>Good documentation keeps the signal visible. Establish the context, make the next action obvious, then leave enough room for the reader to form a useful mental model.</p>
				<aside class="agentic-callout">A dependable operating rhythm: orient → act → inspect → hand off.</aside>
				<h2 id="section-1">{sections[0]}</h2>
				<p>Start with the premise, name the vocabulary, and make the boundary of the system legible before introducing its deeper mechanics.</p>
				<h2 id="section-2">{sections[1]}</h2>
				<p>The detail belongs here: examples, commands, and references should feel like a natural deepening of the opening promise.</p>
			</article>
		</div>
	</main>
</div>
