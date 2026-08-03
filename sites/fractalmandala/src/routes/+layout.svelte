<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';
	import '$lib/styles/index.sass';
	import {
		menuState,
		toggleMenuState,
		iW,
		themeState,
		toggleThemeState
	} from '$lib/utils/globalstores';
	import { slide, fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { Menu, Close } from 'svelte-animated-icon/ion';
	import Sun from '$lib/comps/icon-sun.svelte';
	import Moon from '$lib/comps/icon-moon.svelte';
	import Search from '$lib/comps/search.svelte';

	let { data, children } = $props<{ data: LayoutData; children: any }>();
	let openIndex = $state<number | null>(null);
	let width = $state(0);
	let isMobile = $derived(width < 1201);
	let isHover = $state(false);

	function toggleHover() {
		isHover = !isHover;
	}
	$effect(() => {
		$iW = isMobile;
	});

	// --- Customizable Stagger Parameters ---
	const STAGGER_MS = 40; // Time gap between each list item rendering
	const BASE_DELAY = 100; // Initial wait time (allows slide animation to start first)
	const ANIM_DURATION = 350; // How long the fly transition lasts

	function toggleAccordion(index: number) {
		if (openIndex === index) {
			openIndex = null; // Close if clicked again
		} else {
			openIndex = index; // Open current, closes others
		}
	}

	function closeMenu() {
		if ($menuState) {
			toggleMenuState();
		}
	}
</script>

<svelte:window bind:innerWidth={width} />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="site-wrapper"
	class:theme-light-default={!$themeState}
	class:theme-dark-default={$themeState}
>
	<nav class="mobile-navigation box" class:active={$menuState}>
		{#each data.accordionData as item, index}
			<div class="accordion-item box" class:active={openIndex === index}>
				<button
					type="button"
					class="accordion-trigger row ycenter gap8 w100"
					class:active={openIndex === index}
					onclick={() => toggleAccordion(index)}
					aria-expanded={openIndex === index}
				>
					<span class="sidebar-bank-label">{item.bankName}</span>
					<span class="sidebar-plus text-lg"
						><strong>{openIndex === index ? '−' : '+'}</strong></span
					>
				</button>
				{#if openIndex === index}
					<button
						class="blank accordion-content"
						transition:slide={{ duration: 250 }}
						onclick={closeMenu}
					>
						{#if item.posts.length === 0}
							<span class="empty-msg">No posts found.</span>
						{:else}
							<ul class="sidebar-items-list box padtop8">
								{#each item.posts as post, i}
									<li
										in:fly={{
											y: 12,
											duration: ANIM_DURATION,
											delay: BASE_DELAY + i * STAGGER_MS,
											easing: backOut
										}}
									>
										<a href="/{item.route}/{post.slug}">
											{post.title || post.slug}
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					</button>
				{/if}
			</div>
		{/each}
	</nav>
	<header class="row xbetween">
		<a class="row gap8" href="/">
			<img src="/images/logomotif.png" alt="site logo" />
			<img src="/images/logotype-black.png" alt="site logo type" />
		</a>
		<Search />
		<button class="blank mobile-button" onclick={toggleMenuState}>
			{#if $menuState}
				<Close
					template="cascade"
					variant="filled"
					easing="cubic-bezier(0.25, 0.1, 0.25, 1)"
					size={36}
				/>
			{:else}
				<Menu
					template="cascade"
					variant="filled"
					easing="cubic-bezier(0.25, 0.1, 0.25, 1)"
					size={36}
				/>
			{/if}
		</button>
	</header>
	<main class="site-shell">
		<aside class="sidebar box rgap16">
			{#each data.accordionData as item, index}
				<div class="accordion-item box" class:active={openIndex === index}>
					<button
						type="button"
						class="accordion-trigger row ycenter gap8 w100"
						class:active={openIndex === index}
						onclick={() => toggleAccordion(index)}
						aria-expanded={openIndex === index}
					>
						<img class="bankicon" src="/images/bankicon.png" alt="icon for lables" />
						<span class="sidebar-bank-label">{item.bankName}</span>
					</button>
					{#if openIndex === index}
						<div class="accordion-content" transition:slide={{ duration: 250 }}>
							{#if item.posts.length === 0}
								<span class="empty-msg">No posts found.</span>
							{:else}
								<ul class="sidebar-items-list box gap8 padtop8">
									{#each item.posts as post, i}
										<li
											in:fly={{
												y: 12,
												duration: ANIM_DURATION,
												delay: BASE_DELAY + i * STAGGER_MS,
												easing: backOut
											}}
										>
											<a href="/{item.route}/{post.slug}">
												{post.title || post.slug}
											</a>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
				<div class="accordion-item box">
					<a class="accordion-trigger row ycenter gap8 w100" href="/tags">
						<img class="bankicon" src="/images/bankicon.png" alt="icon for lables" />
						<span class="sidebar-bank-label">Tags</span>
					</a>
				</div>
			<footer class="box padtop16">
				<div class="row gap8 ycenter">
				<button class="blank icon-box" onclick={toggleThemeState}>
					{#if $themeState}
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<Sun color={$themeState ? 'var(--text-muted)' : 'var(--text-primary)'} />
					</svg>
					{:else}
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<Moon color={!$themeState ? 'var(--text-muted)' : 'var(--text-inverse)'} />
					</svg>
					{/if}
				</button>
				<button class="blank icon-box">
					<img src="/images/icon-git.png" alt="github" class="icon16"/>
				</button>
				<button class="blank icon-box">
					<img src="/images/icon-twitter.png" alt="twitter" class="icon16"/>
				</button>
				</div>
			</footer>
		</aside>
		<section class="article">
			{@render children()}
		</section>
	</main>
</div>
