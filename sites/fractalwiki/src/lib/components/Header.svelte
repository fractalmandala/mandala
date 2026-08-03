<script lang="ts">
	import { page } from '$app/stores';

	let {
		onOpenSearch,
		onToggleSidebar,
		theme = $bindable('dark')
	}: {
		onOpenSearch: () => void;
		onToggleSidebar: () => void;
		theme: 'light' | 'dark';
	} = $props();

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		if (typeof document !== 'undefined') {
			document.documentElement.classList.remove('theme-dark', 'theme-light');
			document.documentElement.classList.add(`theme-${theme}`);
		}
	}

	// Compute breadcrumbs from current URL path
	let breadcrumbs = $derived.by(() => {
		const pathname = $page.url.pathname.replace(/^\/|\/$/g, '');
		if (!pathname) return ['Home'];
		return ['Wiki', ...pathname.split('/')];
	});
</script>

<header class="app-header row xbetween ycenter pad16 padleft24 padright24 bdr-bottom">
	<div class="header-left row ycenter gap12">
		<button class="sidebar-toggle btn-icon pad6" onclick={onToggleSidebar} aria-label="Toggle sidebar">
			☰
		</button>
		
		<nav class="breadcrumbs row ycenter gap8 text-xs text-secondary">
			{#each breadcrumbs as crumb, i}
				{#if i > 0}<span class="sep">/</span>{/if}
				<span class="crumb {i === breadcrumbs.length - 1 ? 'text-bold text-primary' : ''}">
					{crumb}
				</span>
			{/each}
		</nav>
	</div>

	<div class="header-right row ycenter gap12">
		<button
			class="search-btn row ycenter gap12 pad8 padleft16 padright16 radius20 text-xs text-secondary"
			onclick={onOpenSearch}
		>
			<span>Search docs...</span>
			<kbd class="kbd-badge pad2 padleft6 padright6 radius4">⌘K</kbd>
		</button>

		<button class="theme-toggle btn-icon pad8 radius20" onclick={toggleTheme} title="Toggle Dark/Light Mode">
			{theme === 'dark' ? '🌙' : '☀️'}
		</button>
	</div>
</header>


