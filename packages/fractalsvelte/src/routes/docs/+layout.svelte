<script lang="ts">
	import '@acrolls/styles/default.css';
	import '@acrolls/docs/styles.css';
	import { page } from '$app/state';
	import { DocsShell } from '@acrolls/docs';
	import { docs } from '$lib/docs/source';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	const isIndex = $derived(page.url.pathname === '/docs' || page.url.pathname === '/docs/');

</script>

<DocsShell nav={docs.nav} pathname={page.url.pathname} showToc={!isIndex} showPager={!isIndex}>
	{@render children()}
</DocsShell>
