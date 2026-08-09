<script lang="ts">
	import { AppShell, toc } from 'fractals-styler/lib';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { tick, type Snippet } from 'svelte';
	import { theme, toggleTheme } from '$lib/utils/globalstores';
	import type { DocNavItem } from '$lib/docs/nav';

	let {
		nav = [],
		title = 'Docs',
		home = '/',
		children
	}: { nav?: DocNavItem[]; title?: string; home?: string; children: Snippet } = $props();

	let mobileOpen = $state(false);
	let article = $state<HTMLElement | null>(null);
	let openKeys = $state<Record<string, boolean>>({});
	let cleanup: (() => void) | undefined;

	const current = $derived(page.url.pathname);

	function isActive(href?: string): boolean {
		return !!href && (current === href || current === href + '/');
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
	{#snippet header(navctl)}
		<div class="row ycenter xbetween w100">
			<a class="row ycenter gap8 blank docs-brand" href={home}>
				<span class="docs-brand-title">{title}</span>
			</a>
			<div class="row ycenter gap16">
				<button class="blank docs-icon-btn" onclick={toggleTheme} aria-label="Toggle theme">
					{$theme === 'dark' ? '☀' : '☾'}
				</button>
				<button class="blank docs-icon-btn mobile-only" onclick={navctl.toggle} aria-label="Toggle menu">
					{navctl.open ? '✕' : '☰'}
				</button>
			</div>
		</div>
	{/snippet}

	{#snippet sidebarleft()}
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

	<div class="docs-content" bind:this={article}>
		{@render children()}
	</div>
</AppShell>
