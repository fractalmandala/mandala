<script lang="ts">

	import Shell from '$lib/comps/pageshell.svelte'

	let { data } = $props();
	let sY = $state(0)

</script>

<svelte:window bind:scrollY={sY}/>

<Shell>
		{#snippet children()}
			<img class="pagemotif" src="/images/logomotif.png" alt="motif" style="transform: rotate({sY*2}deg)"/>
			<div class="box gap16">
			<a class="button-primary inverse fw500" href="/writings">My Writings</a>
			</div>
				{#if data.posts}
					<div class="grid grid-cols-2 gap32">
						{#each data.posts as post}
							{#if post.title !== 'Writings'}
							<a class="bordered blank box gap4 padtop16 padbot16 padleft16 padright16" href="/{post.slug}">
								<span class="card-title text-lg fw600">{post.title}</span>
								<span class="card-desc text-md muted">{post.description}</span>
							</a>
							{/if}
						{/each}
					</div>
				{/if}
		{/snippet}
</Shell>