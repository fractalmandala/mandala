<script lang="ts">
	import { page } from '$app/state';
	import { docsConfig } from '$lib/docs/config.js';
	import type { NavItem } from '$lib/docs/types.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import SocialLinks, { type SocialLink } from '$lib/components/nav/social-links.svelte';
	import SearchCommand from '$lib/components/search/search-command.svelte';
	import type { ComponentProps } from 'svelte';

	let {
		navigation = [],
		socialLinks = [],
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		navigation?: NavItem[];
		socialLinks?: SocialLink[];
	} = $props();

	function isActive(href: string | undefined): boolean {
		if (!href) return false;
		const path = page.url.pathname;
		return path === href || path.startsWith(href + '/');
	}

	function itemHasActive(item: NavItem): boolean {
		if (isActive(item.href)) return true;
		return item.items?.some((child) => itemHasActive(child)) ?? false;
	}

	function sectionIcon(title: string) {
		return docsConfig.sidebar.find((s) => s.label === title)?.icon;
	}

	/** Controlled open state per branch key (section/path). Defaults open when active. */
	let openKeys = $state<Record<string, boolean>>({});

	function keyFor(prefix: string, title: string) {
		return `${prefix}::${title}`;
	}

	function isOpen(key: string, item: NavItem): boolean {
		if (key in openKeys) return openKeys[key];
		return itemHasActive(item);
	}

	function toggle(key: string, item: NavItem) {
		const next = !isOpen(key, item);
		openKeys = { ...openKeys, [key]: next };
	}
</script>

{#snippet navTree(items: NavItem[], prefix: string, depth: number)}
	<ul class="docs-nav-list" class:docs-nav-list-nested={depth > 0} role="list">
		{#each items as item, i (`${prefix}-${item.title}-${item.href ?? i}`)}
			{@const key = keyFor(prefix, item.title)}
			{@const hasChildren = Boolean(item.items?.length)}
			{@const open = hasChildren && isOpen(key, item)}
			<li class="docs-nav-item" class:is-active={isActive(item.href)} class:is-open={open}>
				{#if hasChildren}
					<div class="docs-nav-row">
						{#if item.href}
							<a
								href={item.href}
								class="docs-nav-link"
								class:is-active={isActive(item.href)}
								data-depth={depth}
							>
								{item.title}
							</a>
						{:else}
							<button
								type="button"
								class="docs-nav-link docs-nav-folder"
								data-depth={depth}
								onclick={() => toggle(key, item)}
							>
								{item.title}
							</button>
						{/if}
						<button
							type="button"
							class="docs-nav-chevron"
							aria-expanded={open}
							aria-label={open ? `Collapse ${item.title}` : `Expand ${item.title}`}
							onclick={() => toggle(key, item)}
						>
							<ChevronRightIcon class="docs-nav-chevron-icon" />
						</button>
					</div>
					{#if open}
						{@render navTree(item.items ?? [], key, depth + 1)}
					{/if}
				{:else if item.href}
					<a
						href={item.href}
						class="docs-nav-link"
						class:is-active={isActive(item.href)}
						data-depth={depth}
					>
						{item.title}
					</a>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<Sidebar.Root bind:ref aria-label="Documentation navigation" class="docs-sidebar" {...restProps}>
	<Sidebar.Header class="docs-sidebar-header">
		<a href="/docs" class="docs-sidebar-brand">
			<span class="docs-brand-mark" aria-hidden="true">Fw</span>
			<span class="docs-sidebar-brand-text">
				<span class="docs-sidebar-brand-title">{docsConfig.site.title}</span>
				<span class="docs-sidebar-brand-sub">docs</span>
			</span>
		</a>
	</Sidebar.Header>

	<Sidebar.Content class="docs-sidebar-content">
		<nav class="docs-nav" aria-label="Documentation sections">
			{#each navigation as section (section.title)}
				{@const sKey = keyFor('section', section.title)}
				{@const sOpen = isOpen(sKey, section)}
				{@const Icon = sectionIcon(section.title)}
				<div class="docs-nav-section" class:is-open={sOpen}>
					<button
						type="button"
						class="docs-nav-section-trigger"
						aria-expanded={sOpen}
						onclick={() => toggle(sKey, section)}
					>
						{#if Icon}
							<Icon class="docs-nav-section-icon" />
						{/if}
						<span class="docs-nav-section-label">{section.title}</span>
						<ChevronRightIcon class="docs-nav-chevron-icon docs-nav-section-chevron" />
					</button>
					{#if sOpen}
						{@render navTree(section.items ?? [], sKey, 0)}
					{/if}
				</div>
			{/each}
		</nav>
	</Sidebar.Content>

	<Sidebar.Footer class="docs-sidebar-footer">
		<SearchCommand {navigation} />
		<div class="docs-sidebar-social">
			<SocialLinks links={socialLinks} />
		</div>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
