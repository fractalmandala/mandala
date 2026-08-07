<script lang="ts">
	import type { DocsManifestPage, DocsNavigationNode } from '@docs-kit/core';
	import { createDocsJsonLd, renderDocsJsonLd } from '@docs-kit/seo';

	import type { DocsSiteInfo } from './types.js';

	let {
		page,
		site,
		navigation,
		basePath,
		canonical,
		image,
		alternates = []
	}: {
		page: DocsManifestPage;
		site?: DocsSiteInfo | undefined;
		/** Used to build the breadcrumb trail in structured data. */
		navigation?: DocsNavigationNode[] | undefined;
		basePath?: string | undefined;
		canonical?: string | undefined;
		/** Absolute Open Graph image URL. */
		image?: string | undefined;
		/** Locale alternates, as produced by `createDocsPageMetadata`. */
		alternates?: Array<{ hreflang: string; href: string }>;
	} = $props();

	const title = $derived(site?.title ? `${page.title} · ${site.title}` : page.title);
	const description = $derived(page.description ?? site?.description);
	const url = $derived(
		canonical ?? (site?.url ? new URL(page.pathname, site.url).toString() : undefined)
	);
	const absoluteImage = $derived(
		image === undefined || site?.url === undefined ? image : new URL(image, site.url).toString()
	);
	const jsonLd = $derived(
		renderDocsJsonLd(
			createDocsJsonLd(page, {
				site: { title: site?.title ?? 'Documentation', ...site },
				...(navigation === undefined ? {} : { navigation }),
				...(basePath === undefined ? {} : { basePath }),
				...(absoluteImage === undefined ? {} : { image: absoluteImage })
			})
		)
	);
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}<meta name="description" content={description} />{/if}
	{#if url}<link rel="canonical" href={url} />{/if}
	{#each alternates as alternate (alternate.hreflang)}
		<link rel="alternate" hreflang={alternate.hreflang} href={alternate.href} />
	{/each}
	{#if page.locale}<meta property="og:locale" content={page.locale} />{/if}
	<meta property="og:type" content="article" />
	<meta property="og:title" content={page.title} />
	{#if site?.title}<meta property="og:site_name" content={site.title} />{/if}
	{#if description}<meta property="og:description" content={description} />{/if}
	{#if url}<meta property="og:url" content={url} />{/if}
	{#if absoluteImage}<meta property="og:image" content={absoluteImage} />{/if}
	<meta name="twitter:card" content={absoluteImage ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={page.title} />
	{#if description}<meta name="twitter:description" content={description} />{/if}
	{#if absoluteImage}<meta name="twitter:image" content={absoluteImage} />{/if}
	{#if page.draft || page.hidden}<meta name="robots" content="noindex" />{/if}
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>
