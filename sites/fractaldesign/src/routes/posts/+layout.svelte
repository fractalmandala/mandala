<script lang="ts">
	import DocsShell from '$lib/docs/DocsShell.svelte';
	let { data, children } = $props();
</script>

<DocsShell nav={data.nav} title="Posts" home="/">
	{@render children()}
</DocsShell>
