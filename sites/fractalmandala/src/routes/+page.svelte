<script lang="ts">

	import Shell from '$lib/comps/pageshell.svelte'
	import Note from '$lib/comps/note.svelte';

	let { data } = $props();
	let sY = $state(0)

</script>

<svelte:window bind:scrollY={sY}/>

<Shell>
		{#snippet children()}
			<img class="pagemotif" src="/images/logomotif.png" alt="motif" style="transform: rotate({sY*2}deg)"/>
			<div class="box gap16">
			<Note slug="about" />
			<a class="primary-btn" href="/writings">My Writings</a>
			</div>
				{#if data.posts}
					<div class="grid grid-cols-2 gap8">
						{#each data.posts as post}
							{#if post.title !== 'Writings'}
							<a class="bordered blank box gap4" href="/{post.slug}">
								<span class="card-title">{post.title}</span>
								<span class="card-desc">{post.description}</span>
							</a>
							{/if}
						{/each}
					</div>
				{/if}
		{/snippet}
</Shell>