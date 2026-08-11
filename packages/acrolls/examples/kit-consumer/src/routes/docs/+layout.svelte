<script lang="ts">
	import { page } from '$app/state';
	import { DocsShell } from '@acrolls/docs';
	import { docs } from '$lib/docs/source';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<DocsShell nav={docs.nav} pathname={page.url.pathname}>
	{@render children()}
</DocsShell>
