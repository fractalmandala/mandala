<script lang="ts">
	import 'virtual:fractals-styler.css';
	import '$lib/styles/index.sass';
	import '$lib/styles/comps.sass';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { RiGithubFill, RiNpmjsFill } from 'svelte-remixicon';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import DocsSidebar from '$lib/components/DocsSidebar.svelte';
	import GlobalSearch from '$lib/components/GlobalSearch.svelte';
	import OnThisPage from '$lib/components/OnThisPage.svelte';

	let { data, children } = $props();
	const landingPaths = new Set([
		'/',
		'/docs',
		'/docs/bosses',
		'/docs/wiki',
		'/bosses',
		'/skills',
		'/agents',
		'/commands'
	]);
	let currentPath = $derived(page.url.pathname.replace(/\/$/, '') || '/');
	let isLanding = $derived(landingPaths.has(currentPath));

	const links = [
		{ href: '/docs', label: 'Docs' },
		{ href: '/docs/bosses', label: 'Bosses' },
		{ href: '/skills', label: 'Skills' },
		{ href: '/agents', label: 'Agents' },
		{ href: '/commands', label: 'Commands' },
		{ href: '/docs/wiki', label: 'Wiki' }
	] as const;

	function isCurrent(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/docs') return path === '/' || path.startsWith('/docs');
		if (href === '/docs/bosses') return path.startsWith('/docs/bosses') || path === '/bosses';
		if (href === '/docs/wiki') return path.startsWith('/docs/wiki');
		return path === href || path.startsWith(`${href}/`);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<meta
		name="description"
		content="Fractal Agentic documentation — domain bosses, orchestration, armory, and continuous LLM wiki."
	/>
</svelte:head>

<div class="appshell">
	<header class="app-header">
		<a class="logo row ycenter gap8" href="/" aria-label="fractalagentic home">
			<img src="/images/fractalagentic.png" alt="" />
			<span class="wordmark"><span>fractal</span><span class="muted">agentic</span></span>
		</a>
		<nav class="row ycenter gap16" aria-label="Primary">
			<div class="row ycenter gap16">
				{#each links as link, index (link.href)}
					{#if index > 0}
						<span class="divider" aria-hidden="true"></span>{/if}
					<a
						class="nav-links"
						href={link.href}
						aria-current={isCurrent(link.href) ? 'page' : undefined}
					>
						{link.label}
					</a>
				{/each}
			</div>
			<div class="row ycenter gap16">
				<GlobalSearch items={data.search} />
				<a
					class="icon-button"
					href="https://github.com/fractalmandala/fractal-agentic"
					rel="noopener noreferrer"
					target="_blank"
					aria-label="Open GitHub"
				>
					<RiGithubFill size={'18'} />
				</a>
				<a
					class="icon-button"
					href="https://www.npmjs.com/package/fractal-agentic"
					rel="noopener noreferrer"
					target="_blank"
					aria-label="Open npm"
				>
					<RiNpmjsFill size={'18'} />
				</a>
				<ThemeToggle />
			</div>
		</nav>
	</header>

	<main class="app-shell-main">
		<div class="narrow-width">
			{@render children()}
		</div>
	</main>

	<div class="content">
		<aside class="app-sidebar" aria-label="Documentation navigation">
			{#if isLanding}
				<DocsSidebar sections={data.sidebar} />
			{/if}
		</aside>
		<main class="app-shell-main">
			<div class="docs-shell__mobile">
				<MobileNav />
			</div>
			{@render children()}
		</main>
		<aside class="app-right" aria-label="On this page">
			{#if isLanding}
				<OnThisPage />
			{/if}
		</aside>
	</div>
</div>
