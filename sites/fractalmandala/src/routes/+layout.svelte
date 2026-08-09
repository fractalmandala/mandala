<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';
	import '$lib/styles/index.sass';
	import 'virtual:fractals-styler.css';
	import { AppShell, toc } from 'fractals-styler/lib';
	import { themeState, toggleThemeState } from '$lib/utils/globalstores';
	import { browser } from '$app/environment';
	import { Agentation, type AnnotationProps } from 'fractal-agentation';
	import { slide, fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import Sun from '$lib/comps/icon-sun.svelte';
	import Moon from '$lib/comps/icon-moon.svelte';
	import Search from '$lib/comps/search.svelte';
	import { sidebarExtras } from '$lib/state/sidebar-extras.svelte';
	import { page } from '$app/state';

	let { data, children } = $props<{ data: LayoutData; children: any }>();
	let openIndex = $state<number | null>(null);
	let mobileOpen = $state(false);

	const logotypeSrc = $derived($themeState ? '/images/logotype-white.png' : '/images/logotype-black.png');

	// Reflect the theme on <html> so tokens + ambient switch site-wide.
	$effect(() => {
		if (!browser) return;
		const t = $themeState ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', t);
		document.documentElement.classList.toggle('dark', $themeState);
	});

	// Staggered reveal for accordion post lists
	const STAGGER_MS = 40;
	const BASE_DELAY = 100;
	const ANIM_DURATION = 350;

	function toggleAccordion(index: number) {
		openIndex = openIndex === index ? null : index;
	}

  const workspaceRoot = '/Users/amrit/mandala/sites/fractalmandala';
  const annotationProps: AnnotationProps = {
    workspaceRoot
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


{#if browser}
	<Agentation {...annotationProps} />
{/if}

<AppShell bind:mobileOpen ambient={false} showRight={toc.items.length >= 2 || sidebarExtras.alsoSee.length > 0}>
	{#snippet header(nav)}
		<div class="appheader-inner">
			<a class="row ycenter gap8" href="/" onclick={nav.close}>
				<img src="/images/logomotif.png" alt="site logo" />
				<img src={logotypeSrc} alt="site logo type" />
			</a>
			<div class="row ycenter gap16">
				<div class="desktop-only">
					<Search />
				</div>
				<button class="blank icon-box" onclick={toggleThemeState} aria-label="Toggle theme">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						{#if $themeState}
							<Sun color="var(--text-secondary)" />
						{:else}
							<Moon color="var(--text-secondary)" />
						{/if}
					</svg>
				</button>
				<button class="blank mobile-only" onclick={nav.toggle} aria-label="Toggle menu">
					<span class="text-lg">{nav.open ? '✕' : '☰'}</span>
				</button>
			</div>
		</div>
	{/snippet}

	{#snippet sidebarleft()}
		<nav class="box rgap16" aria-label="Contents">
			{#each data.accordionData as item, index}
				<div class="accordion-item box" class:active={openIndex === index}>
					<button
						type="button"
						class="accordion-trigger row ycenter gap8 w100 text-sm text-left"
						class:active={openIndex === index}
						onclick={() => toggleAccordion(index)}
						aria-expanded={openIndex === index}
					>
						<img class="bankicon" src="/images/bankicon.png" alt="" />
						<span class="sidebar-bank-label text-sm fw500">{item.bankName}</span>
					</button>
					{#if openIndex === index}
						<div class="accordion-content" transition:slide={{ duration: 250 }}>
							{#if item.posts.length === 0}
								<span class="empty-msg muted text-sm muted">No posts found.</span>
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
											<a class="text-sm sec" href="/{item.route}/{post.slug}" onclick={() => (mobileOpen = false)}>
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
				<a class="accordion-trigger row ycenter gap8 w100 text-sm" href="/tags" onclick={() => (mobileOpen = false)}>
					<img class="bankicon" src="/images/bankicon.png" alt="" />
					<span class="sidebar-bank-label">Tags</span>
				</a>
			</div>
			<div class="row ycenter gap8 padtop32 padleft8">
				<button class="blank icon-box" aria-label="GitHub">
					<img src="/images/icon-git.png" alt="github" class="icon16" />
				</button>
				<button class="blank icon-box" aria-label="Twitter">
					<img src="/images/icon-twitter.png" alt="twitter" class="icon16" />
				</button>
			</div>
		</nav>
	{/snippet}

	{#snippet sidebarright()}
		{#if toc.items.length >= 2}
			<nav class="box rgap8" aria-label="On this page">
				<span class="text-sm tt-c muted">On this page</span>
				{#each toc.items as h (h.id)}
					<a
						class="text-md blank link"
						class:padleft8={h.level === 3}
						class:link={toc.activeId === h.id}
						href="#{h.id}"
						onclick={(e) => {
							e.preventDefault();
							toc.goTo(h.id);
						}}
					>
						<span class="sec">{h.text}</span>
					</a>
				{/each}
			</nav>
		{/if}
		{#if sidebarExtras.alsoSee.length > 0}
			{#if toc.items.length >= 2}
				<div class="bdr-top padtop16"></div>
			{/if}
			<nav class="box rgap8" aria-label="Also See">
				<span class="text-sm tt-c muted">Also See:</span>
				{#each sidebarExtras.alsoSee as link}
					<a class="text-md blank link" href={link.href}>
						<span class="sec">{link.label}</span>
					</a>
				{/each}
			</nav>
		{/if}
	{/snippet}

	{@render children()}
</AppShell>
