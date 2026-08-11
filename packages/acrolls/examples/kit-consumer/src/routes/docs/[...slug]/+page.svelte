<script lang="ts">
	import DocumentPage from '$lib/docs/DocumentPage.svelte';

	let { data }: { data: { slug: string } } = $props();
</script>

<DocumentPage slug={data.slug} />
