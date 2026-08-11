<script lang="ts">
	import { AppShell, toc } from 'fractals-styler/lib';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { tick, type Snippet } from 'svelte';
	import { theme, toggleTheme } from '$lib/utils/globalstores';
	import type { DocNavItem } from '$lib/docs/nav';
	import DesignDocumentTemplate from '$lib/templates/DesignDocumentTemplate.svelte';

	/** Mobile drawer controls surfaced to the header snippet (may be absent during SSR). */
	interface NavCtl {
		open: boolean;
		toggle: () => void;
	}

	let {
		nav = [],
		title = 'Docs',
		home = '/',
		sidebarTop,
		children
	}: {
		nav?: DocNavItem[];
		title?: string;
		home?: string;
		/** Optional content rendered above the nav tree (e.g. a search box). */
		sidebarTop?: Snippet;
		children: Snippet;
	} = $props();

	let mobileOpen = $state(false);
	let article = $state<HTMLElement | null>(null);
	let openKeys = $state<Record<string, boolean>>({});
	let cleanup: (() => void) | undefined;

	const current = $derived(page.url.pathname);
	const currentFull = $derived(page.url.pathname + page.url.search);

	function isActive(href?: string): boolean {
		if (!href) return false;
		// Query-based hrefs (e.g. /components?c=Alert) match the full URL exactly.
		if (href.includes('?')) return currentFull === href;
		return current === href || current === href + '/';
	}
	function branchActive(item: DocNavItem): boolean {
		return isActive(item.href) || item.items.some(branchActive);
	}
	function isOpen(key: string, item: DocNavItem): boolean {
		return key in openKeys ? openKeys[key] : branchActive(item);
	}
	function toggle(key: string, item: DocNavItem) {
		openKeys = { ...openKeys, [key]: !isOpen(key, item) };
	}

	// Re-extract headings into the shared TOC store after every navigation.
	afterNavigate(async () => {
		await tick();
		cleanup?.();
		if (!article) return;
		toc.setHeadings(article);
		cleanup = toc.observe(article);
		mobileOpen = false;
	});
</script>

{#snippet tree(items: DocNavItem[], prefix: string, depth: number)}
	<ul class="docs-nav-list" class:nested={depth > 0}>
		{#each items as item (prefix + item.order)}
			{@const key = prefix + '/' + item.order}
			{@const hasChildren = item.items.length > 0}
			{@const open = hasChildren && isOpen(key, item)}
			<li class="docs-nav-item">
				<div class="docs-nav-row row ycenter">
					{#if item.href}
						<a
							href={item.href}
							class="docs-nav-link"
							class:active={isActive(item.href)}
							data-depth={depth}
						>
							{item.title}
						</a>
					{:else}
						<button type="button" class="docs-nav-link blank" data-depth={depth} onclick={() => toggle(key, item)}>
							{item.title}
						</button>
					{/if}
					{#if hasChildren}
						<button
							type="button"
							class="docs-nav-toggle blank"
							aria-expanded={open}
							aria-label={open ? 'Collapse' : 'Expand'}
							onclick={() => toggle(key, item)}
						>
							{open ? '−' : '+'}
						</button>
					{/if}
				</div>
				{#if hasChildren && open}
					{@render tree(item.items, key, depth + 1)}
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<AppShell bind:mobileOpen ambient showRight={toc.items.length > 0}>
	{#snippet header(navctl: NavCtl | undefined)}
		<div class="row ycenter xbetween w100">
			<a class="row ycenter gap8 blank docs-brand" href={home}>
				<img class="docs-brand-mark" src="/images/logomotif.png" alt="" />
				<span class="docs-brand-title">{title}</span>
			</a>
			<div class="row ycenter gap16">
				<button class="blank docs-icon-btn" onclick={toggleTheme} aria-label="Toggle theme">
					{#if $theme === 'dark'}
						<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
							<circle cx="12" cy="12" r="4" />
							<path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
						</svg>
					{/if}
				</button>
				{#if navctl}
					<button class="blank docs-icon-btn mobile-only" onclick={navctl.toggle} aria-label="Toggle menu">
						{navctl.open ? '✕' : '☰'}
					</button>
				{/if}
			</div>
		</div>
	{/snippet}

	{#snippet sidebarleft()}
		{@render sidebarTop?.()}
		<nav class="docs-nav" aria-label="Documentation">
			{@render tree(nav, 'root', 0)}
		</nav>
	{/snippet}

	{#snippet sidebarright()}
		{#if toc.items.length >= 2}
			<nav class="docs-toc box rgap8" aria-label="On this page">
				<span class="text-sm tt-c col3">On this page</span>
				{#each toc.items as h (h.id)}
					<a
						href="#{h.id}"
						class="docs-toc-link"
						class:sub={h.level === 3}
						class:active={toc.activeId === h.id}
						onclick={(e) => {
							e.preventDefault();
							toc.goTo(h.id);
						}}
					>
						{h.text}
					</a>
				{/each}
			</nav>
		{/if}
	{/snippet}

	{#snippet footer()}
		<div class="row ycenter xbetween w100">
			<span class="text-sm col3">© {new Date().getFullYear()} Fractal Design</span>
			<a class="text-sm col3 blank" href={home}>Home</a>
		</div>
	{/snippet}

	<DesignDocumentTemplate>
		<div class="docs-content" bind:this={article}>
			{@render children()}
		</div>
	</DesignDocumentTemplate>
</AppShell>
