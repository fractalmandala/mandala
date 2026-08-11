<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state'
	import '$lib/styles/index.sass';
	import 'virtual:fractals-styler.css';
	import '@mistweaverco/mdsvex-shiki/styles.css';
	import { browser } from '$app/environment';
	import { theme, toggleTheme, isDrawerOpen, toggleDrawer } from '$lib/utils/globalstores'
	import { Agentation, type AnnotationProps } from 'fractal-agentation';
	import { native } from '$lib/states/nativestate.svelte'
	import Drawer from '$lib/components/drawer.svelte'
	import { Github, Twitter } from 'svelte-animated-icon/remix'
	import { copyAction } from '@mistweaverco/mdsvex-shiki/copyAction';

	let { children } = $props();
	let current = $derived(page.url.pathname)
	// Docs sections bring their own <AppShell> chrome — suppress the site chrome there.
	let isDocs = $derived(
		current.startsWith('/sveltekit') || current.startsWith('/posts') || current.startsWith('/components')
	)

	const nav = [
		{ href: '/components', label: 'Components' },
		{ href: '/play', label: 'Play' },
		{ href: '/about', label: 'About' }
	];

	const isCurrent = (href: string) =>
		href === '/' ? current === '/' : current.startsWith(href);

	$effect(() => {
		if (browser) {
			document.documentElement.setAttribute('data-theme', $theme);
			document.documentElement.classList.toggle('dark', $theme === 'dark');
		}
	});

  let playgroundAnnotationProps: AnnotationProps = {
    toolbarPosition: 'top-left',
    outputMode: 'compact',
    pauseAnimations: true,
    clearOnCopy: true,
    includeComponentContext: false,
    includeComputedStyles: false
  };
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if browser}
	<Agentation {...playgroundAnnotationProps} />
{/if}

<div class="{$theme}" data-theme={$theme} inert={$isDrawerOpen ? true : undefined}>
{#if isDocs}
	<main use:copyAction>
		{@render children()}
	</main>
{:else}
	<header class="fd-header">
		<a class="fd-brand" href="/" aria-label="Fractal Design home">
			<img src="/images/logomotif.png" alt="" />
			<img class="fd-logo-black" src="/images/logotype-black.png" alt="Fractal Design" />
			<img class="fd-logo-white" src="/images/logotype-white.png" alt="Fractal Design" />
		</a>
		<nav class="fd-nav" aria-label="Primary">
			{#each nav as item}
				<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>{item.label}</a>
			{/each}
		</nav>
		<div class="fd-actions">
			{#if current === '/play/canvas'}
				<button class="button-quiet" onclick={() => native.toggleSidebar()}>
					Sidebar {native.sidebarCollapsed}
				</button>
				<button class="button-quiet" onclick={() => native.toggleRightbar()}>
					<span>rightbar {native.rightbarCollapsed}r</span>
				</button>
			{/if}
			<button class="icon-btn" onclick={toggleTheme} aria-label="Toggle theme">
				{#if $theme === 'dark'}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
				{/if}
			</button>
			<button class="icon-btn fd-menu" onclick={toggleDrawer} aria-label="Open menu">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
			</button>
		</div>
	</header>
	<main use:copyAction>
		{@render children()}
	</main>
	<footer class="fd-footer">
		<div class="fd-wrap">
			<span class="eyebrow">© 2026 Fractal Design — curation + playground</span>
			<div class="row ycenter gap8">
				<a href="https://www.fractalmandala.in" target="_blank" rel="noreferrer">fractalmaṇḍala</a>
				<a href="https://www.bodharesearch.in" target="_blank" rel="noreferrer">Bodha</a>
				<a class="blank" href="https://github.com/fractalmandala/fractals" target="_blank" rel="noreferrer" aria-label="GitHub">
					<Github template="iris" variant="fill" speed={0.75} easing="cubic-bezier(0.25, 0.1, 0.25, 1)" size={18} />
				</a>
				<a class="blank" href="https://x.com/saamaanyafreaky" target="_blank" rel="noreferrer" aria-label="X / Twitter">
					<Twitter template="iris" variant="fill" speed={0.75} easing="cubic-bezier(0.25, 0.1, 0.25, 1)" size={18} />
				</a>
			</div>
		</div>
	</footer>
{/if}
</div>
<Drawer>
	<a href="/" onclick={toggleDrawer}>Home</a>
	<a href="/components" onclick={toggleDrawer}>Components</a>
	<a href="/play" onclick={toggleDrawer}>Play</a>
	<a href="/posts" onclick={toggleDrawer}>Posts</a>
	<a href="/about" onclick={toggleDrawer}>About</a>
	<a href="/contact" onclick={toggleDrawer}>Contact</a>
</Drawer>
