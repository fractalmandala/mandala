<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import 'virtual:fractals-styler.css';
	import '$lib/styles/index.sass';

	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';

	let { data, children } = $props();

	let isSidebarOpen = $state(true);
	let isSearchOpen = $state(false);
	let theme = $state<'light' | 'dark'>(data.siteConfig.site.defaultTheme || 'dark');

	// Handle Cmd+K global shortcut
	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			isSearchOpen = !isSearchOpen;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{data.siteConfig.site.title}</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
</svelte:head>

<div class="app-container theme-{theme} row min-h-screen">
	<Sidebar navGroups={data.navGroups} bind:isOpen={isSidebarOpen} />

	<div class="app-main flex-col flex-1 width100">
		<Header
			onOpenSearch={() => (isSearchOpen = true)}
			onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
			bind:theme
		/>

		<main class="content-area pad24 width100">
			{@render children()}
		</main>
	</div>
</div>

<SearchModal bind:isOpen={isSearchOpen} navGroups={data.navGroups} />


