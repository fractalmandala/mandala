<script lang="ts">

	import Shell from '$lib/comps/pageshell.svelte'
	let { data } = $props();
	let searchQuery = $state('');

	let filteredTags = $derived(
		data.tags.filter((tag: string) => 
			tag.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>All Tags | Fractal Mandala</title>
</svelte:head>


<Shell>
	{#snippet children()}
		<div class="box rgap8">
			<h1 class="text-3xl fw600 lh11">All Tags</h1>
			<p class="text-bs sec">Browse all topics by tags across the entire knowledge base.</p>
			<div class="row gap8 padtop8 padbot8">
				<input 
					type="text" 
					placeholder="Search tags..." 
					bind:value={searchQuery}
					class="pad8 r4 text-md"
					style="width: 100%; max-width: 400px; border: 1px solid var(--border-default); background: var(--surface-input); color: var(--text-primary);"
				/>
			</div>
		</div>
		{#if filteredTags.length > 0}
			<div class="row gap4 wrap">
				{#each filteredTags as tag}
					<a  class="pill text-xs tt-u fw500 ls-wide inverse large"  href="/tags/{tag}">{tag.replaceAll('-',' ')}</a>
				{/each}
			</div>
		{:else}
			<p class="text-md muted italic">No tags match your search.</p>
		{/if}
	{/snippet}
</Shell>