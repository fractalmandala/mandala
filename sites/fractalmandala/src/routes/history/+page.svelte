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
			<h1 class="text-3xl fw600 lh11">{data.title}</h1>
			<p class="text-bs sec">{data.description}</p>
		</div>
		{#if data.posts && data.posts.length > 0}
			<div class="grid grid-cols-2 gap32">
				{#each data.posts as post}
					<a class="blank box bordered gap8" href={post.linkpath}>
						<span class="text-lg fw600">{post.title}</span>
						<span class="text-md muted">{post.description}</span>
					</a>
				{/each}
			</div>
		{:else}
			<p class="text-md muted italic">No articles found in this folder.</p>
		{/if}
	{/snippet}
	{#snippet asides()}
		<div class="box sticky-box">
			<div class="row gap4 wrap">
				{#each data.allTags as tag}
					<span class="pill text-xs tt-u fw500 ls-wide inverse">{tag.tag.replaceAll('-',' ')}</span>
				{/each}
			</div>
		</div>
	{/snippet}
</Shell>
