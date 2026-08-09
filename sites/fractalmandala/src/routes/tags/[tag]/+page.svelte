<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Items tagged with #{data.tag} | Fractal Mandala</title>
</svelte:head>

<section class="page-wrapper padtop32 padbot32">
	<div class="box rgap16">
		<h1 class="text-3xl bold lh11">#{data.tag}</h1>
		<p class="text-md sec">Wiki articles tagged with #{data.tag} across all banks:</p>
		
		<hr style="border: 0; border-top: 1px solid var(--border-default); width: 100%; margin: 8px 0;" />
		
		{#if data.items && data.items.length > 0}
			<ul class="box rgap16 pad4" style="list-style: none; margin: 0; padding: 0;">
				{#each data.items as item}
					<li class="box rgap4 padbot8" style="border-bottom: 1px solid var(--border-subtle);">
						<a class="text-lg hover-underline" href={item.linkpath} style="color: var(--theme-color); font-weight: 500;">
							{item.title}
						</a>
						<span class="text-xs muted">Bank: {item.bank}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-md muted italic">No articles found with this tag.</p>
		{/if}
		
		<div class="padtop16">
			<a class="text-md col-theme hover-underline" href="/tags" style="color: var(--theme-color); font-weight: 500;">← Back to all tags</a>
		</div>
	</div>
</section>
