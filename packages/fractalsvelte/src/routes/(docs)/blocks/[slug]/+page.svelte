<script lang="ts">
	import DocPage from '$lib/docs/DocPage.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
</script>

<DocPage {data} />
