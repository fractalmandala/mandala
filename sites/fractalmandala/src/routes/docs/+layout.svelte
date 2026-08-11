<script lang="ts">
	/**
	 * Copy to src/routes/docs/+layout.svelte
	 */
	import '@acrolls/styles/foundation.css';
	import '@acrolls/docs/styles.css';
	import { page } from '$app/state';
	import { DocsShell } from '@acrolls/docs';
	import { docsNav } from '$lib/docs/nav';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const isIndex = $derived(page.url.pathname === '/docs/' || page.url.pathname === '/docs');
</script>

<div class="docs-root">
	<DocsShell
		nav={docsNav}
		pathname={page.url.pathname}
		homeHref="/"
		homeLabel="Home"
		filterable={true}
		showToc={!isIndex}
		showPager={!isIndex}
		persistOpen={true}
		menuLabel="Docs menu"
	>
		{@render children()}
	</DocsShell>
</div>

<style>
	.docs-root {
		--acrolls-docs-accent: var(--brand, #6d28d9);
		padding: 1rem 1rem 3rem;
		max-width: 90rem;
		margin-inline: auto;
	}
</style>
