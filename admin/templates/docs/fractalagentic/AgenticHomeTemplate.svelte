<script lang="ts">
	type Theme = 'light' | 'dark';

	type System = {
		index: string;
		title: string;
		summary: string;
		href: string;
	};

	type Props = {
		theme?: Theme;
		brand?: string;
		systems?: System[];
	};

	let {
		theme = 'light',
		brand = 'fractal_agentic / armory',
		systems = [
			{ index: '01', title: 'Bosses', summary: 'Named capabilities for hard engineering work.', href: '/docs/bosses' },
			{ index: '02', title: 'Patterns', summary: 'Small protocols with a long half-life.', href: '/docs/patterns' },
			{ index: '03', title: 'Playbooks', summary: 'From first prompt to durable system.', href: '/docs/playbooks' },
			{ index: '04', title: 'Continuity', summary: 'Context that survives the next handoff.', href: '/docs/continuity' }
		]
	} = $props<Props>();
</script>

<svelte:head>
	<title>{brand}</title>
</svelte:head>

<div class={`theme-${theme} agentic-home`} data-theme={theme}>
	<header class="l-cluster agentic-nav">
		<a class="agentic-brand" href="/">{brand}</a>
		<nav class="l-cluster agentic-links" aria-label="Primary navigation">
			<a href="/docs">Documentation</a>
			<a href="/docs/bosses">Bosses</a>
			<a href="/about">About</a>
		</nav>
		<div class="l-cluster agentic-tools">
			<label class="u-visually-hidden" for="agentic-search">Search armory</label>
			<input id="agentic-search" type="search" placeholder="Search armory" />
			<button class="u-icon-button" type="button" aria-label="Open menu">•••</button>
		</div>
	</header>

	<main>
		<section class="l-switcher agentic-hero" aria-labelledby="agentic-title">
			<div class="agentic-hero-copy">
				<div class="u-label">A field guide for agentic systems</div>
				<h1 id="agentic-title">Build the loop. Keep the signal.</h1>
				<p>Practical patterns, bosses, and operating notes for people building software that can reason, act, and recover.</p>
				<div class="l-cluster agentic-actions">
					<a class="u-action u-action-primary" href="/docs">Open the armory</a>
					<a class="u-action u-action-secondary" href="/docs/getting-started">Read the field guide</a>
				</div>
			</div>
			<div class="agentic-console" aria-label="System status">
				<div class="l-cluster agentic-console-heading"><strong>System / ready</strong><span>v0.7.3</span></div>
				<div class="l-cluster agentic-console-row"><span>Context continuity</span><strong>100%</strong></div>
				<div class="l-cluster agentic-console-row"><span>Active playbooks</span><strong>24</strong></div>
				<div class="l-cluster agentic-console-row"><span>Last handoff</span><strong>Clean</strong></div>
			</div>
		</section>

		<section class="agentic-index" aria-labelledby="agentic-index-title">
			<header class="l-cluster agentic-section-heading"><h2 id="agentic-index-title">Armory index</h2><span>{systems.length} systems / browse all</span></header>
			<div class="l-stack agentic-system-list">
				{#each systems as system}
					<a class="l-cluster agentic-system" href={system.href}>
						<span class="u-label">{system.index}</span>
						<strong>{system.title}</strong>
						<span>{system.summary}</span>
						<span class="u-label">Open →</span>
					</a>
				{/each}
			</div>
		</section>
	</main>
</div>
