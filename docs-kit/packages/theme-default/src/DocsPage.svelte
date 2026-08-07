<script lang="ts">
	import type { Snippet } from 'svelte';

	import { createDocsDimensionSwitchers } from './dimensions.js';
	import DocsFooter from './DocsFooter.svelte';
	import DocsHead from './DocsHead.svelte';
	import DocsHeader from './DocsHeader.svelte';
	import DocsLayout from './DocsLayout.svelte';
	import SkipLink from './SkipLink.svelte';
	import CopyCode from './CopyCode.svelte';
	import type { DocsPageData } from './types.js';

	let {
		data,
		shell = true,
		head = true,
		footer = true,
		children,
		footerContent,
		search,
		image,
		manifest
	}: {
		data: DocsPageData;
		/** Render the framework's own header, skip link, and footer. */
		shell?: boolean;
		head?: boolean;
		footer?: boolean;
		children: Snippet;
		footerContent?: Snippet;
		/** Search trigger and dialog, rendered in the header. */
		search?: Snippet;
		/** Open Graph image for this page, absolute or site-relative. */
		image?: string | undefined;
		/**
		 * Generated manifest. Supplying it makes the header's version and locale switchers
		 * appear automatically for versioned or multilingual documentation.
		 */
		manifest?: import('@docs-kit/core').DocsManifest | undefined;
	} = $props();

	const switchers = $derived(
		manifest === undefined
			? { versions: [], locales: [] }
			: createDocsDimensionSwitchers({
					manifest,
					page: data.page,
					...(data.basePath === undefined ? {} : { basePath: data.basePath })
				})
	);
</script>

{#if head}
	<DocsHead
		page={data.page}
		site={data.site}
		navigation={data.navigation}
		basePath={data.basePath}
		{image}
	/>
{/if}

{#if shell}
	<div class="docs-shell">
		<SkipLink />
		<DocsHeader
			title={data.site?.title ?? 'Documentation'}
			basePath={data.basePath ?? '/docs'}
			navigation={data.navigation}
			pathname={data.page.pathname}
			{search}
			versions={switchers.versions}
			locales={switchers.locales}
		/>

		<DocsLayout {data}>{@render children()}</DocsLayout>

		{#if footer}
			<DocsFooter>{#if footerContent}{@render footerContent()}{/if}</DocsFooter>
		{/if}
	</div>
{:else}
	<DocsLayout {data}>{@render children()}</DocsLayout>
{/if}

<CopyCode />
