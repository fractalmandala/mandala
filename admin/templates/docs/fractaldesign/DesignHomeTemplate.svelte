<script lang="ts">
	type Theme = 'light' | 'dark';

	type Collection = {
		index: string;
		title: string;
		summary: string;
		href: string;
	};

	type Props = {
		theme?: Theme;
		brand?: string;
		logoSrc?: string;
		collections?: Collection[];
	};

	let {
		theme = 'light',
		brand = 'fractaldesign / notes',
		logoSrc = '',
		collections = [
			{ index: '01', title: 'Foundations', summary: 'Tokens, rhythm, and the shape of a system.', href: '/docs/foundations' },
			{ index: '02', title: 'Components', summary: 'The practical vocabulary of the interface.', href: '/docs/components' },
			{ index: '03', title: 'Playground', summary: 'Experiments worth keeping around.', href: '/playground' }
		]
	} = $props<Props>();
</script>

<svelte:head>
	<title>{brand}</title>
</svelte:head>

<div class={`theme-${theme} design-home`} data-theme={theme}>
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

	<main>
		<section class="l-switcher design-intro" aria-labelledby="design-title">
			<div>
				<div class="l-cluster design-meta"><span>Fractal design / 001</span><a href="/archive">Open archive ↗</a></div>
				<h1 id="design-title">Design is a way of making room.</h1>
			</div>
			<p> A working archive of systems, components, and visual experiments for software that feels considered.</p>
		</section>

		<section class="l-switcher design-board" aria-label="Design collections">
			<a class="design-feature" href="/notes/make-the-system-feel-inevitable">
				<span class="u-label">Featured note</span>
				<h2>Make the system feel inevitable.</h2>
				<p>Foundations for interfaces with a point of view.</p>
			</a>
			{#each collections as collection}
				<a class="design-card" href={collection.href}>
					<span class="u-label">{collection.index} / collection</span>
					<h2>{collection.title}</h2>
					<p>{collection.summary}</p>
				</a>
			{/each}
		</section>
	</main>
</div>
