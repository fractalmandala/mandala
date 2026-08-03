<script lang="ts">
	import Shell from '$lib/comps/pageshell.svelte';
	import GraphViewer from '$lib/comps/GraphViewer.svelte';
</script>

<svelte:head>
	<title>History Graph | Fractal Mandala</title>
	<meta name="description" content="Interactive knowledge graph of the History wiki." />
</svelte:head>

<Shell>
	{#snippet children()}
		<div class="box rgap8">
			<h1 class="text-3xl w600">History Graph</h1>
			<p class="text-bs col2">An interactive view of the History knowledge graph.</p>
		</div>
		<GraphViewer src="/graphs/history/graph.json" />
	{/snippet}
</Shell>
