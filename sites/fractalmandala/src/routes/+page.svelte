<script lang="ts">
	import MandalaHomeTemplate from '$lib/templates/MandalaHomeTemplate.svelte';
	let { data } = $props();
</script>

<MandalaHomeTemplate posts={data.posts} writingsCategories={data.writingsCategories} />
