<script lang="ts">
	import Shell from '$lib/comps/pageshell.svelte';
	import GraphViewer from '$lib/comps/GraphViewer.svelte';
</script>

<svelte:head>
	<title>Comparative Civilization Graph | Fractal Mandala</title>
	<meta name="description" content="Interactive knowledge graph of the Comparative Civilization wiki." />
</svelte:head>

<Shell>
	{#snippet children()}
		<div class="box rgap8">
			<h1 class="text-3xl fw600 lh11">Comparative Civilization Graph</h1>
			<p class="text-bs sec">An interactive view of the Comparative Civilization knowledge graph.</p>
		</div>
		<GraphViewer src="/graphs/comparative-civilization/graph.json" />
	{/snippet}
</Shell>
