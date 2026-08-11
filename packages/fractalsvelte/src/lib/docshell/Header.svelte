<script lang="ts">
	import { page } from '$app/state';
	import { mode } from 'mode-watcher';
	import ThemeSwitcher from './ThemeSwitcher.svelte';
	import DocSearch from './DocSearch.svelte';
	import { nav } from './nav.svelte.js';

	const path = $derived(page.url.pathname);
	const inDocs = $derived(
		path.startsWith('/components') || path.startsWith('/ai') || path.startsWith('/blocks')
	);
</script>

<header class="app-header row ycenter gap32">
	<div class="row ycenter gap8">
		{#if inDocs}
			<button
				class="doc-nav-toggle"
				type="button"
				aria-label="Toggle navigation"
				onclick={() => (nav.open = !nav.open)}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
		{/if}
		<a class="logo-area row ycenter gap8" href="/">
			<img class="logomotif" src="/images/logomotif.png" alt="logomotif" />
			{#if mode.current === 'dark'}
				<img class="logotype" src="/images/logotype-w.png" alt="fractalsvelte" />
			{:else}
				<img class="logotype" src="/images/logotype-b.png" alt="fractalsvelte" />
			{/if}
		</a>
	</div>

	<nav class="row ycenter gap32">
		<a
			class="header-link text-sm"
			href="/docs/design"
			class:active={path.startsWith('/docs/design')}
		>
			Design
		</a>
		<a class="header-link text-sm" href="/docs" class:active={path.startsWith('/docs')}>
			Docs
		</a>
		<a class="header-link text-sm" href="/docs/areas" class:active={path.startsWith('/docs/areas')}>
			Areas
		</a>
		<ThemeSwitcher />
		<DocSearch />
	</nav>
</header>
