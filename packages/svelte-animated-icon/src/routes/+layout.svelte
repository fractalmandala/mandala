<script lang="ts">
	import { page } from '$app/state'
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/index.sass';
	import type { LayoutProps } from './$types';
	import { darkTheme, toggleTheme } from './utils/globalstores';
	import Sun from '$lib/phosphor/icons/Sun.svelte'
	import Moon from '$lib/phosphor/icons/Moon.svelte'
	import Menu from '$lib/components/menu.svelte'

	let { data, children }: LayoutProps = $props();
	let iW = $state(0)
	let menuOpen = $state(false)
	let current = $derived(page.url.pathname.replace(/^\//, ''));

	function toggleMenu(){
		menuOpen = !menuOpen
	}

	function closeMenu(){
		if (menuOpen) {
			menuOpen = false
		}
	}

</script>

<svelte:window bind:innerWidth={iW}/>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="site-wrapper" class:light={!$darkTheme} class:dark={$darkTheme}>
	<header class="row xbetween ycenter">
		<a class="row ycenter gap4 site-name" href="/">
			<img src="/images/logomotif.png" alt="site logo" id="motif" />
			<span class="site-name-text">SVELTE ANIMATED ICON</span>
		</a>
		<nav class="row ycenter gap16">
			<a class="nav-link text-bs tt-c" href="/phosphor" class:col-theme={current === 'phosphor'}>Phosphor</a>
			<a class="nav-link text-bs tt-c" href="/remix" class:col-theme={current === 'remix'}>Remix</a>
			<a class="nav-link text-bs tt-c" href="/flowbite" class:col-theme={current === 'flowbite'}>Flowbite</a>
			<a class="nav-link text-bs tt-c" href="/ion" class:col-theme={current === 'ion'}>Ion</a>
			<a class="nav-link text-bs tt-c" href="/hero" class:col-theme={current === 'hero'}>Hero</a>
			<button class="blank mobile-menu" onclick={toggleMenu}>
				<Menu/>
			</button>
			<button class="blank theme-toggler" onclick={toggleTheme}>
				{#if $darkTheme}
				<Sun variant="fill" template="spin" size={20}/>
				{:else}
				<Moon variant="fill" size={20} template="glitch" speed={2.5} easing="ease-in" loop={true}/>
				{/if}
			</button>
		</nav>
	</header>
	<main class="site-shell">
		<aside class="sidebar box rgap32">
			<div class="box sidebar-accordion">
				<span>Getting Started</span>
				{#if data.docsOne}
					{#each data.docsOne as item}
						<a href={item.linkpath}>{item.meta.title}</a>
					{/each}
				{/if}
			</div>
			<div class="box sidebar-accordion">
				<span>Customization</span>
				{#if data.docsTwo}
					{#each data.docsTwo as item}
						<a href={item.linkpath}>{item.meta.title}</a>
					{/each}
				{/if}
			</div>
			<div class="box sidebar-accordion">
				<span>API Reference</span>
				{#if data.docsThree}
					{#each data.docsThree as item}
						<a href={item.linkpath}>{item.meta.title}</a>
					{/each}
				{/if}
			</div>
			<div class="box sidebar-accordion">
				<span>Guides and Advanced</span>
				{#if data.docsFour}
					{#each data.docsFour as item}
						<a href={item.linkpath}>{item.meta.title}</a>
					{/each}
				{/if}
			</div>
			<div class="box sidebar-accordion">
				<span>Other</span>
				{#if data.docsFive}
					{#each data.docsFive as item}
						<a href={item.linkpath}>{item.meta.title}</a>
					{/each}
				{/if}
			</div>
			<footer class="box">
				<span class="text-sm col2">2026 All Rights Reserved | Fractals Creation Engine</span>
				<span class="text-sm col2"
					>Also Visit - <a href="https://www.fractaldharma.in" target="_blank" rel="noreferrer"
						>Fractaldharma</a
					>
					|
					<a href="https://www.fractalwork.in" target="_blank" rel="noreferrer">Fractalwork</a
					></span
				>
			</footer>
		</aside>
		<section class="content">
			<section class="article">
				{@render children()}
			</section>
		</section>
	</main>
{#if iW < 1025 && menuOpen}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<section class="mobile-navigation box gap32" onclick={closeMenu}>
			<div class="box">
				<span>Getting Started</span>
				{#if data.docsOne}
					{#each data.docsOne as item}
						<a href={item.linkpath}>{item.meta.title}</a>
					{/each}
				{/if}
			</div>
			<div class="box">
				<span>Customization</span>
				{#if data.docsTwo}
					{#each data.docsTwo as item}
						<a href={item.linkpath}>{item.meta.title}</a>
					{/each}
				{/if}
			</div>
			<div class="box">
				<span>API Reference</span>
				{#if data.docsThree}
					{#each data.docsThree as item}
						<a href={item.linkpath}>{item.meta.title}</a>
					{/each}
				{/if}
			</div>
			<div class="box">
				<span>Guides and Advanced</span>
				{#if data.docsFour}
					{#each data.docsFour as item}
						<a href={item.linkpath}>{item.meta.title}</a>
					{/each}
				{/if}
			</div>
			<div class="box">
				<span>Other</span>
				{#if data.docsFive}
					{#each data.docsFive as item}
						<a href={item.linkpath}>{item.meta.title}</a>
					{/each}
				{/if}
			</div>
</section>
{/if}
</div>
