<script lang="ts">

	import Shell from '$lib/comps/pageshell.svelte'

	let { data } = $props();
	let sY = $state(0)

</script>

<svelte:window bind:scrollY={sY}/>

<Shell>
		{#snippet children()}
		<div class="full-width">
			<div class="home-hero box ycenter gap32 padbot64">
				<span class="text-xs fw500 tt-u themed row ycenter gap8">
					Essays | Fiction | Knowledge Bases
				</span>
				<h1 class="text-5xl lh12">fractal <span class="themed"> maṇḍala </span>, where Indian Civilization, Philosophy, and Modern Tech Intersect.</h1>
				<p class="text-2xl lh15 sec">A personal repository of long-form essays, creative worldbuilding, and structured wiki archives — pick a stream to begin.</p>
			</div>
		</div>
		<div class="full-width">
				{#if data.writingsCategories && data.writingsCategories.length > 0}
						<div class="home-steps grid grid-cols-3 gap24">
							{#each data.writingsCategories as cat}
								<a class="home-step blank box gap8" href="/writings/{cat.slug.split('/').pop()}">
									<span class="text-lg fw600">{cat.title}</span>
									<span class="text-md sec">{cat.description}</span>
								</a>
							{/each}
						</div>
				{/if}
		</div>
				{#if data.posts}
		<div class="full-width padtop64 box gap32">
					<h3 class="text-2xl">Knowledge Banks</h3>
					<div class="home-steps grid grid-cols-3 gap24">
						{#each data.posts as post, i}
							{#if post.title !== 'Writings'}
							<a class="home-step blank box gap8" href="/{post.slug}">
								<span class="home-step-title text-lg fw600">{post.title}</span>
								<span class="home-step-desc text-md sec">{post.description}</span>
							</a>
							{/if}
						{/each}
					</div>
		</div>
				{/if}
		{/snippet}
</Shell>