<script lang="ts">
	import 'virtual:fractals-styler.css';
	import '$lib/styles/index.sass';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { RiGithubFill, RiNpmjsFill } from 'svelte-remixicon';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import DocsSidebar from '$lib/components/DocsSidebar.svelte';
	import GlobalSearch from '$lib/components/GlobalSearch.svelte';

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
	let iW = $state(0)

	const links = [
		{ href: '/docs', label: 'Docs' },
		{ href: '/docs/bosses', label: 'Bosses' },
		{ href: '/skills', label: 'Skills' },
		{ href: '/agents', label: 'Agents' },
		{ href: '/commands', label: 'Commands' },
		{ href: '/docs/wiki', label: 'Wiki' }
	] as const;

	const statsLabel = $derived(
		`${data.stats.skills} SKILLS · ${data.stats.agents} AGENTS · ${data.stats.commands} commands · 1 orchestrator`
	);

	function isCurrent(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/docs/guide') return path === '/' || path.startsWith('/docs');
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

<svelte:window bind:innerWidth={iW}/>


<div class="appshell">
	<header class="app-header" class:narrow-header={isLanding}>
		<div class="row xbetween ycenter w100">
			<div class="row ycenter gap16">
				<a class="blank gap0 row ycenter gap8" href="/">
					<img class="sz36 site-logo" src="/images/fractalagentic.png" alt="logo" />
					<p class="bold text-lg lstightx">fractal<span class="accented">agentic</span></p>
				</a>
			</div>
			<nav class="row gap16 ycenter" aria-label="Primary">
				{#each links as link (link.href)}
					<a
						class="nav-link"
						href={link.href}
						aria-current={isCurrent(link.href) ? 'page' : undefined}
					>
						{link.label}
					</a>
				{/each}
				<div class="row gap8 ycenter">
					<GlobalSearch items={data.search} />
					<a
						class="btn-icon"
						href="https://github.com/fractalmandala/fractal-agentic"
						rel="noopener noreferrer"
						target="_blank"
					>
						<RiGithubFill size={'20'} />
					</a>
					<a
						class="btn-icon"
						href="https://www.npmjs.com/package/fractal-agentic"
						rel="noopener noreferrer"
						target="_blank"
					>
						<RiNpmjsFill size={'20'} />
					</a>
					<ThemeToggle />
				</div>
			</nav>
		</div>
	</header>
	{#if isLanding}
		<main class="main new-layout">
				<aside class="left-side"></aside>
				<div class="inside center">
			<div class="narrow-width">
				{@render children()}
			</div>
				</div>
				<aside class="right-side"></aside>
		</main>
	{:else}
		<div class="content-grid">
			<aside class="sidebar">
				<DocsSidebar sections={data.sidebar} {statsLabel} />
			</aside>
			<main class="main">
				<div class="docs-shell__mobile">
					<MobileNav />
				</div>
				{@render children()}
			</main>
		</div>
	{/if}
</div>
