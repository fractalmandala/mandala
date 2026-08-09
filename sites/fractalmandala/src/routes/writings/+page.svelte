<script lang="ts">
	import Shell from '$lib/comps/pageshell.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title} | Fractal Mandala</title>
	<meta name="description" content={data.description} />
</svelte:head>

<div class="narrow-width padtop128 padbot128">
		<div class="box gap16 bordbot padbot32">
			<h1 class="text-5xl fw600 lh11">{data.title}</h1>
			<p class="text-xl sec">{data.description}</p>
			<div class="row gap4 wrap">
				{#each data.allTags as tag}
					<span class="pill text-xs tt-u fw500 ls-wide inverse">{tag.tag.replaceAll('-',' ')}</span>
				{/each}
			</div>
		</div>
		{#if data.topicMap && data.topicMap.length > 0}
			<div class="home-steps grid grid-cols-2 gap16">
				{#each data.topicMap as cat}
					<a class="home-step blank box gap8" href="/{data.slug}/{cat.slug.split('/').pop()}">
						<span class="text-lg fw600">{cat.title}</span>
						<span class="text-md sec">{cat.description}</span>
					</a>
				{/each}
			</div>
		{:else}
			<p class="text-md muted italic">No articles found in this folder.</p>
		{/if}
</div>