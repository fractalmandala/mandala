<script lang="ts">
	import 'virtual:fractals-styler.css';
	import '$lib/styles/index.sass'
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import SearchBox from '$lib/content/themes/docs/SearchBox.svelte';
	import SearchDialog from '$lib/content/themes/docs/search/SearchDialog.svelte';
	import ThemeToggle from '$lib/content/themes/docs/ThemeToggle.svelte';
	import { REPO_URL, SITE_NAME, SITE_URL } from '$lib/site';
	import Npm from '$lib/icons/npm.svelte'
	import Github2 from '$lib/icons/github2.svelte';

	let { children }: { children: Snippet } = $props();

	// Every prerendered route gets a matching social card from
	// scripts/og/generate.mjs (build/og/<route>.png), so the URL derives
	// straight from the path. The tags only render once SITE_URL is set:
	// scrapers require absolute og:image URLs, and a relative one would send
	// SvelteKit's prerender crawler after /og/*.png files that don't exist
	// until after the build.
	const currentPath = $derived(page.url.pathname.replace(/\/$/, '') || '/');
	const ogImage = $derived(`${SITE_URL}/og${currentPath === '/' ? '/index' : currentPath}.png`);

	let searchDialog: ReturnType<typeof SearchDialog> | undefined = $state();

	function onWindowKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			searchDialog?.open();
		}
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<svelte:head>
	<meta property="og:site_name" content={SITE_NAME} />
	{#if SITE_URL}
		<meta property="og:image" content={ogImage} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={ogImage} />
	{/if}
</svelte:head>

<a class="skip" href="#main-content">Skip to content</a>

<div class="app-shell">
	<header class="app-header">
		<div class="topbar">
			<a class="brand" href={resolve('/')}>
				<img src="/images/fractalagentic.png" class="logomotif" alt="logo" />
				<img
					src="/images/logotype-white.png"
					class="logotype logotype-dark"
					alt="fractalagentic"
				/>
				<img
					src="/images/logotype-black.png"
					class="logotype logotype-light"
					alt="fractalagentic"
				/>
			</a>
			<div class="actions">
				<div class="search-wrap">
					<SearchBox onOpen={() => searchDialog?.open()} />
				</div>
				<ThemeToggle />
			</div>
		</div>
	</header>

	<SearchDialog bind:this={searchDialog} />

	<main id="main-content">
		{@render children()}
	</main>

	<footer class="app-footer">
		<div class="footer-wrap">
			<span>by <a href="https://www.fractalmandala.in" target="_blank" rel="noreferrer">fractalmandala</a> | <a href="https://www.fractaldesign.in" target="_blank" rel="noreferrer">fractaldesign</a> | <a href="https://www.fractalsvelte.in" target="_blank" rel="noreferrer">fractalsvelte</a></span>
			<div class="row ycenter gap16">
				<a href="https://github.com/fractalmandala/mandala" target="_blank" rel="noreferrer"><Github2/></a>
				<a href="https://www.npmjs.com/package/fractal-agentic" target="_blank" rel="noreferrer"><Npm/></a>
			</div>
		</div>
	</footer>

	<!-- Filter behind the theme-switch dissolve; see the ::view-transition rules in the styles. -->
	<svg class="dissolve-defs" width="0" height="0" aria-hidden="true" focusable="false">
		<filter
			id="svocs-dissolve"
			x="-15%"
			y="-15%"
			width="130%"
			height="130%"
			color-interpolation-filters="sRGB"
		>
			<feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="7" result="noise" />
			<feDisplacementMap
				in="SourceGraphic"
				in2="noise"
				xChannelSelector="R"
				yChannelSelector="G"
				scale="0"
				result="displaced"
			>
				<animate attributeName="scale" values="0;90" dur="0.9s" begin="indefinite" fill="freeze" />
			</feDisplacementMap>
			<feColorMatrix
				in="noise"
				type="matrix"
				values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
				result="alpha-noise"
			/>
			<feComponentTransfer in="alpha-noise" result="threshold">
				<feFuncA type="linear" slope="16" intercept="1">
					<animate attributeName="intercept" values="1;-16" dur="0.9s" begin="indefinite" fill="freeze" />
				</feFuncA>
			</feComponentTransfer>
			<feComposite in="displaced" in2="threshold" operator="in" />
		</filter>
	</svg>
</div>