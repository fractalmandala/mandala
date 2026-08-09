<script lang="ts">
	import CollectionView from '$lib/components/CollectionView.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>Posts · fractaldesign docs</title>
</svelte:head>

<CollectionView collection={data.collection} label={data.label} docs={data.docs} />
