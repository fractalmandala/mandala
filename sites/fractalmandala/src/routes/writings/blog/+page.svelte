<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title} | Fractal Mandala</title>
</svelte:head>

<section class="page-wrapper padtop32 padbot32">
	<div class="box rgap16">
		<h1 class="text-3xl bold lh11">{data.title}</h1>
		<p class="text-md sec">Explore blog articles in {data.title}.</p>
		
		<hr style="border: 0; border-top: 1px solid var(--border-default); width: 100%; margin: 16px 0;" />
		
		{#if data.posts && data.posts.length > 0}
			<ul class="box rgap8 pad4" style="list-style: none; margin: 0; padding: 0;">
				{#each data.posts as post}
					<li class="row ycenter gap8 padbot4">
						<span class="muted" style="font-size: var(--text-xs); user-select: none;">•</span>
						<a class="text-lg hover-underline" href={post.linkpath} style="color: var(--theme-color); font-weight: 500;">
							{post.title || post.slug}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-md muted italic">No blog posts found in this folder.</p>
		{/if}
	</div>
</section>
