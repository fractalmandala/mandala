<script lang="ts">

	import type { PageData } from './$types';

	let { data } = $props();

</script>

<div class="grid grid-cols-4 gap32">
<div class="box">
	{#if data.pages}
		{#each data.pages as page}
			<a class="blank" href={page.link}>
				<h2>{page.title}</h2>
				<p>{page.description}</p>
			</a>
		{/each}
	{/if}
</div>
</div>