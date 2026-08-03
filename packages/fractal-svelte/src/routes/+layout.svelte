<script lang="ts">
	import '$lib/styles/index.sass';
	import '$site/site.sass';
	import SiteShell from '$site/SiteShell.svelte';
	let { children } = $props();
</script>

<SiteShell>{@render children()}</SiteShell>
