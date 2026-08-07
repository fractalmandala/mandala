<script lang="ts">

	import Shell from '$lib/components/pageshell.svelte'
	import '$lib/styles/prism.css'
	let { data } = $props();

</script>

<svelte:head>
<script src="/src/lib/utils/prism.js"></script>
</svelte:head>

<Shell paddingtop="64" paddingbottom="64">
<div>
	<section class="post-header box gap16">
		<h1>{data.title}</h1>
		<div class="box gap8">
		<p>{data.description}</p>
		{#if data.tags}
			<div class="row gap8 wrap">
				{#each data.tags as tag}
					<span class="pill">{tag}</span>
				{/each}
			</div>
		{/if}
		</div>
	</section>
	<article class="post-article">
		<data.content/>
	</article>
</div>
</Shell>