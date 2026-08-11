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
		searchLabel?: string;
		collections?: Collection[];
	};

	let {
		theme = 'light',
		brand = 'fractal mandala',
		searchLabel = 'Search knowledge',
		collections = [
			{ index: '01', title: 'Civilization', summary: 'Patterns of people, power, and place.', href: '/civilization' },
			{ index: '02', title: 'Comparative worlds', summary: 'Many lenses, one widening field.', href: '/comparative-civilization' },
			{ index: '03', title: 'Writings', summary: 'Notes from the edge of the map.', href: '/writings' }
		]
	} = $props<Props>();
</script>

<svelte:head>
	<title>{brand}</title>
</svelte:head>

<div class={`theme-${theme} mandala-home`} data-theme={theme}>
	<header class="l-cluster mandala-nav">
		<a class="mandala-brand" href="/">{brand}</a>
		<nav class="l-cluster mandala-links" aria-label="Primary navigation">
			<a href="/">Index</a>
			<a href="/writings">Writings</a>
			<a href="/about">About</a>
		</nav>
		<div class="l-cluster mandala-tools">
			<label class="u-visually-hidden" for="mandala-search">{searchLabel}</label>
			<input id="mandala-search" type="search" placeholder={searchLabel} />
			<button class="u-icon-button" type="button" aria-label="Open menu">•••</button>
		</div>
	</header>

	<main>
		<section class="l-center mandala-hero" aria-labelledby="mandala-title">
			<div class="u-label">A living knowledge bank</div>
			<h1 id="mandala-title">Make room for the whole pattern.</h1>
			<p class="mandala-hero-copy">A quiet, cross-disciplinary library for ideas that become clearer when they are allowed to sit beside one another.</p>
			<div class="l-cluster mandala-actions">
				<a class="u-action u-action-primary" href="/civilization">Enter the library</a>
				<a class="u-action u-action-secondary" href="/map">View the map</a>
			</div>
			<div class="mandala-orbit" aria-hidden="true"><span>ॐ</span></div>
		</section>

		<section class="l-center mandala-collections" aria-labelledby="mandala-collections-title">
			<header class="l-cluster mandala-section-heading">
				<h2 id="mandala-collections-title">Knowledge bank</h2>
				<span>{collections.length} collections</span>
			</header>
			<div class="l-switcher mandala-card-list">
				{#each collections as collection}
					<a class="mandala-card" href={collection.href}>
						<span class="u-label">{collection.index}</span>
						<h3>{collection.title}</h3>
						<p>{collection.summary}</p>
					</a>
				{/each}
			</div>
		</section>
	</main>
</div>
