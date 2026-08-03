<script lang="ts">
	import Shell from '$lib/comps/pageshell.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title} | Fractal Mandala</title>
	<meta name="description" content={data.description} />
</svelte:head>

<Shell>
	{#snippet children()}
		<div class="box rgap8">
			<h1 class="text-3xl w600">{data.title}</h1>
			<p class="text-bs col2">{data.description}</p>
		</div>
		{#if data.posts && data.posts.length > 0}
			<div class="grid grid-cols-2 gap8">
				{#each data.posts as post}
					<a class="blank box bordered gap8" href={post.linkpath}>
						<span class="text-lg w600">{post.title}</span>
						<span class="text-md col3">{post.description}</span>
					</a>
				{/each}
			</div>
		{:else}
			<p class="text-md col3 italic">No articles found in this folder.</p>
		{/if}
	{/snippet}
	{#snippet asides()}
		<div class="box sticky-box">
			<div class="row gap4 wrap">
				{#each data.allTags as tag}
					<span class="pill">{tag.tag.replaceAll('-',' ')}</span>
				{/each}
			</div>
		</div>
	{/snippet}
</Shell>
