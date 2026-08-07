<script lang="ts">
	import type { Snippet } from 'svelte';

	import Breadcrumbs from './Breadcrumbs.svelte';
	import Pagination from './Pagination.svelte';
	import Sidebar from './Sidebar.svelte';
	import Toc from './Toc.svelte';
	import PageHeader from './PageHeader.svelte';
	import type { DocsPageData } from './types.js';

	let {
		data,
		toc = true,
		sidebar = true,
		header = true,
		breadcrumbs = true,
		pagination = true,
		children,
		aside
	}: {
		data: DocsPageData;
		toc?: boolean;
		sidebar?: boolean;
		header?: boolean;
		breadcrumbs?: boolean;
		pagination?: boolean;
		children: Snippet;
		aside?: Snippet;
	} = $props();

	const headings = $derived(data.toc ?? data.page.headings);
	const showToc = $derived(toc && headings.some((heading) => heading.depth >= 2));
	// A document that writes its own `# Title` keeps it; otherwise the theme renders one,
	// so a page never shows two level-one headings.
	const showHeader = $derived(header && !headings.some((heading) => heading.depth === 1));
</script>

<div class="docs-layout" class:docs-layout--no-toc={!showToc}>
	{#if sidebar}
		<Sidebar navigation={data.navigation} pathname={data.page.pathname} />
	{/if}

	<main class="docs-content" id="docs-content">
		{#if breadcrumbs}
			<Breadcrumbs navigation={data.navigation} pathname={data.page.pathname} />
		{/if}
		{#if showHeader}
			<PageHeader title={data.page.title} description={data.page.description} />
		{/if}
		{#if aside}{@render aside()}{/if}

		<div class="docs-prose">{@render children()}</div>

		{#if pagination}
			<Pagination previous={data.previous ?? data.page.previous} next={data.next ?? data.page.next} />
		{/if}
	</main>

	{#if showToc}
		<Toc {headings} />
	{/if}
</div>
