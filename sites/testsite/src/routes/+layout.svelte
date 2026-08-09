<script lang="ts">
	import '$lib/styles/shell.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let { children, data } = $props();

	let navOpen = $state(false);

	onMount(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') navOpen = false;
		};
		const onResize = () => {
			if (window.matchMedia('(min-width: 1101px)').matches) navOpen = false;
		};
		document.addEventListener('keydown', onKey);
		window.addEventListener('resize', onResize);
		return () => {
			document.removeEventListener('keydown', onKey);
			window.removeEventListener('resize', onResize);
		};
	});

	function toggleNav() {
		navOpen = !navOpen;
	}

	function toggleTheme() {
		const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', next);
		try {
			localStorage.setItem('fd-docs-theme', next);
		} catch {
			// storage unavailable — theme still applies for this session
		}
	}

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.body.classList.toggle('nav-open', navOpen);
		}
	});

	// $derived so these track client-side navigation (the layout persists across
	// route changes — plain consts would go stale and break active states).
	let path = $derived(page.url.pathname);
	let kind = $derived((page.data.kind as 'home' | 'collection' | 'doc') ?? 'home');
	let currentCollection = $derived(page.data.collection as string | undefined);

	// Close the mobile drawer when the route changes (in-drawer navigation, back/forward).
	// Track ONLY the path — reading navOpen here would close the drawer the instant it opens.
	let lastPath: string | undefined;
	$effect(() => {
		if (path !== lastPath) {
			lastPath = path;
			navOpen = false;
		}
	});

	function isActive(href: string): boolean {
		return path === href || path.startsWith(href + '/');
	}

	function docCount(name: string): number {
		return data.nav.find((c) => c.name === name)?.docs.length ?? 0;
	}
</script>

<div class="app">
	<button type="button" class="nav-scrim" aria-label="Close navigation menu" onclick={toggleNav}></button>

	<header class="topbar">
		<button
			type="button"
			class="menu-toggle"
			aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
			aria-expanded={navOpen}
			onclick={toggleNav}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
				<path d="M4 7h16M4 12h16M4 17h16" />
			</svg>
		</button>

		<a class="brand" href="/">
			<span class="brand-mark">fd</span>
			<span>fractaldesign</span>
		</a>

		<nav class="topnav" aria-label="Primary">
			<a class="nav-link" class:is-active={path === '/'} href="/">Home</a>
			<a class="nav-link" class:is-active={isActive('/posts')} href="/posts">Posts</a>
			<a class="nav-link" class:is-active={isActive('/sveltemotion')} href="/sveltemotion"
				>SvelteMotion</a
			>
		</nav>

		<div class="topbar-actions">
			<button
				type="button"
				class="icon-btn"
				aria-label="Toggle theme"
				title="Toggle theme"
				onclick={toggleTheme}
			>
				<!-- the icon is driven purely by [data-theme] CSS: correct icon from the
				     pre-paint bootstrap, no JS state, no hydration mismatch -->
				<svg class="theme-icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
				</svg>
				<svg class="theme-icon icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
					<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.4 5.4 0 0 1-7.54-7.54C12.92 2.94 12.46 3 12 3Z" />
				</svg>
			</button>
			<a class="btn btn-primary" href="/posts">Read docs</a>
		</div>
	</header>

	<div class="shell">
		<aside class="sidebar" aria-label="Site navigation">
			<div class="side-section">
				<div class="side-label">Browse</div>
				<nav class="side-nav">
					<a class="side-link" class:is-active={path === '/'} href="/">Overview</a>
					{#each data.nav as collection (collection.name)}
						<a
							class="side-link"
							class:is-active={path === `/${collection.name}` ||
								path.startsWith(`/${collection.name}/`)}
							href={`/${collection.name}`}
						>
							{collection.label}
							<span class="side-badge">{docCount(collection.name)}</span>
						</a>
					{/each}
				</nav>
			</div>

			{#if kind !== 'home' && currentCollection}
				<div class="side-section">
					<div class="side-label">{currentCollection === 'posts' ? 'Posts' : 'SvelteMotion'}</div>
					<nav class="side-nav">
						{#each data.nav.find((c) => c.name === currentCollection)?.docs ?? [] as doc (doc.slug)}
							<a
								class="side-link"
								class:is-active={path === `/${currentCollection}/${doc.slug}`}
								href={`/${currentCollection}/${doc.slug}`}
							>
								{doc.title}
							</a>
						{/each}
					</nav>
				</div>
			{/if}
		</aside>

		<main class="main" id="content">{@render children()}</main>

		<aside class="toc" aria-label="On this page">
			{#if kind === 'doc' && page.data.toc?.length}
				<div class="toc-title">On this page</div>
				<nav class="toc-list">
					{#each page.data.toc as item (item.id)}
						<a
							class:sub={item.level === 3}
							href={`#${item.id}`}
							data-toc-id={item.id}
							onclick={(e) => {
								e.preventDefault();
								document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
								history.replaceState(null, '', `#${item.id}`);
							}}
						>
							{item.text}
						</a>
					{/each}
				</nav>
				<div class="toc-foot">
					<a
						href="#top"
						onclick={(e) => {
							e.preventDefault();
							window.scrollTo({ top: 0, behavior: 'smooth' });
							history.replaceState(null, '', window.location.pathname);
						}}
					>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
							<path d="M12 19V5M5 12l7-7 7 7" />
						</svg>
						Back to top
					</a>
				</div>
			{:else}
				<div class="toc-title">{kind === 'home' ? 'On this site' : 'Collections'}</div>
				<nav class="toc-list">
					{#if kind === 'home'}
						<a href="/" class:is-active={path === '/'}>Overview</a>
						<a href="/posts" class:is-active={isActive('/posts')}>Posts</a>
						<a href="/sveltemotion" class:is-active={isActive('/sveltemotion')}>SvelteMotion</a>
					{:else}
						<a href="/posts" class:is-active={isActive('/posts')}>Posts</a>
						<a href="/sveltemotion" class:is-active={isActive('/sveltemotion')}>SvelteMotion</a>
					{/if}
				</nav>
			{/if}
		</aside>
	</div>
</div>

<style lang="sass">
	// testsite tweaks on top of the shell design system
	.topbar-actions
		margin-left: auto

	@media (max-width: 1100px)
		.topbar-actions
			margin-left: 0
</style>
