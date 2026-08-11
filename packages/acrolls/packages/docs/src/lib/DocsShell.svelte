<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DocsCrumb, DocsNav, DocsPagerLink } from './types.js';
	import { buildDocsCrumbs, docsPager, withNavIds } from './nav.js';
	import DocsSidebar from './DocsSidebar.svelte';
	import DocsBreadcrumbs from './DocsBreadcrumbs.svelte';
	import DocsPager from './DocsPager.svelte';
	import DocsToc from './DocsToc.svelte';

	type Props = {
		nav: DocsNav;
		pathname: string;
		crumbs?: DocsCrumb[];
		homeHref?: string;
		homeLabel?: string;
		filterable?: boolean;
		showPager?: boolean;
		/** Right-rail table of contents from article headings */
		showToc?: boolean;
		/** Break out of a constrained host column when the shell owns the page layout */
		fullBleed?: boolean;
		tocMinLevel?: number;
		tocMaxLevel?: number;
		persistOpen?: boolean;
		menuLabel?: string;
		children: Snippet;
		header?: Snippet;
	};

	let {
		nav: navIn,
		pathname,
		crumbs,
		homeHref = '/',
		homeLabel = 'Home',
		filterable = true,
		showPager = true,
		showToc = true,
		fullBleed = false,
		tocMinLevel = 2,
		tocMaxLevel = 3,
		persistOpen = true,
		menuLabel = 'Docs menu',
		children,
		header
	}: Props = $props();

	const nav = $derived(withNavIds(navIn));

	const resolvedCrumbs = $derived(
		crumbs ?? buildDocsCrumbs(nav, pathname, { homeHref, homeLabel })
	);
	const pager = $derived(docsPager(nav, pathname));
	const previous = $derived(pager.previous as DocsPagerLink);
	const next = $derived(pager.next as DocsPagerLink);

	let mobileOpen = $state(false);
	let articleEl = $state<HTMLElement | null>(null);

	$effect(() => {
		pathname;
		mobileOpen = false;
	});
</script>

<div
	class="acrolls-docs-shell"
	class:is-mobile-nav-open={mobileOpen}
	class:has-toc={showToc}
	class:is-full-bleed={fullBleed}
>
	<button
		type="button"
		class="acrolls-docs-shell__menu-btn"
		aria-expanded={mobileOpen}
		aria-controls="acrolls-docs-sidebar"
		onclick={() => (mobileOpen = !mobileOpen)}
	>
		{mobileOpen ? 'Close menu' : menuLabel}
	</button>

	{#if mobileOpen}
		<button
			type="button"
			class="acrolls-docs-shell__backdrop"
			aria-label="Close documentation menu"
			onclick={() => (mobileOpen = false)}
		></button>
	{/if}

	<div class="acrolls-docs-shell__sidebar" id="acrolls-docs-sidebar">
		<DocsSidebar
			{nav}
			{pathname}
			{filterable}
			{persistOpen}
			class="acrolls-docs-sidebar--shell"
		/>
	</div>

	<div class="acrolls-docs-shell__main">
		<header class="acrolls-docs-shell__top">
			<DocsBreadcrumbs crumbs={resolvedCrumbs} />
			{#if header}
				<div class="acrolls-docs-shell__header-extra">
					{@render header()}
				</div>
			{/if}
		</header>

		<div class="acrolls-docs-shell__body">
			<div class="acrolls-docs-shell__content">
				<div class="acrolls-docs-shell__article" bind:this={articleEl}>
					{@render children()}
				</div>

				{#if showPager && (previous || next)}
					<footer class="acrolls-docs-shell__footer">
						<DocsPager {previous} {next} />
					</footer>
				{/if}
			</div>

			{#if showToc}
				<aside class="acrolls-docs-shell__toc" aria-label="Table of contents">
					<DocsToc contentEl={articleEl} watch={pathname} minLevel={tocMinLevel} maxLevel={tocMaxLevel} />
				</aside>
			{/if}
		</div>
	</div>
</div>
