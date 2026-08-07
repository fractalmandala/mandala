<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state'
	import '$lib/styles/index.sass';
	import 'virtual:fractals-styler.css';
	import '@mistweaverco/mdsvex-shiki/styles.css';
	import { browser } from '$app/environment';
	import { theme, toggleTheme, isDrawerOpen, toggleDrawer } from '$lib/utils/globalstores'
	import { native } from '$lib/states/nativestate.svelte'
 	import Drawer from '$lib/components/drawer.svelte'
	import { Github, Twitter } from 'svelte-animated-icon/remix'
	import { copyAction } from '@mistweaverco/mdsvex-shiki/copyAction';

	let { children } = $props();
	let current = $derived(page.url.pathname)

	$effect(() => {
		if (browser) {
			document.documentElement.setAttribute('data-theme', $theme);
			document.documentElement.classList.toggle('dark', $theme === 'dark');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="{$theme}" data-theme={$theme} inert={$isDrawerOpen ? true : undefined}>
	<header class="row ycenter site-padding xbetween">
		<a class="row ycenter blank gap4" href="/">
			<img class="site-logo logomotif" src="/images/logomotif.png" alt="logo motif"/>
			<img class="site-logo logotype" src="/images/logotype-black.png" alt="logo type"/>
		</a>
		<div class="row ycenter gap8">
		{#if current === '/play/canvas'}
			<button class="button-quiet" onclick={() => native.toggleSidebar()}>
				Sidebar {native.sidebarCollapsed}
			</button>
			<button class="button-quiet rightbar" onclick={() => native.toggleRightbar()}>
				<span>rightbar {native.rightbarCollapsed}r</span>
			</button>
		{/if}
		<button class="icon-button" onclick={toggleTheme} aria-label="Toggle theme">
			{#if $theme === 'dark'}
				☀️
			{:else}
				🌙
			{/if}
		</button>
		<button class="button-quiet" onclick={toggleDrawer}>
			<span>drawer</span>
		</button>
		</div>
	</header>
	<main class="box" use:copyAction>
		{@render children()}
	</main>
	<footer class="row ycenter site-padding xbetween">
		<div class="row ycenter gap8">
			<span class="text-sm col3">2026 | Fractals Creation Engine</span>
		</div>
		<div class="row ycenter gap8">
			<a style="color: var(--text-secondary)" class="blank" href="https://github.com/fractalmandala/fractals" target="_blank" rel="noreferrer">
				<Github template="iris" variant="fill" speed={0.75} easing="cubic-bezier(0.25, 0.1, 0.25, 1)" size={20} />
			</a>
			<a style="color: var(--text-secondary)" class="blank" href="https://x.com/saamaanyafreaky" target="_blank" rel="noreferrer">
				<Twitter template="iris" variant="fill" speed={0.75} easing="cubic-bezier(0.25, 0.1, 0.25, 1)" size={20} />
			</a>
		</div>
	</footer>
</div>
<Drawer>
	<a href="/" onclick={toggleDrawer}>Home</a>
	<a href="/about" onclick={toggleDrawer}>About</a>
	<a href="/contact" onclick={toggleDrawer}>Contact</a>
</Drawer>
