<script lang="ts">
	import type { PageData } from './$types';
	import AgenticHomeTemplate from '$lib/templates/AgenticHomeTemplate.svelte';

	let { data }: { data: PageData } = $props();
</script>

<AgenticHomeTemplate bosses={data.bosses} counts={data.counts} version={data.version} />
