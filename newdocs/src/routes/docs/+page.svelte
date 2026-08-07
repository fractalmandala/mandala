<script lang="ts">
	let { data } = $props();
</script>

<article id="doc-content" class="doc-content">
	<header>
		<h1>Documentation</h1>
		<p class="text-muted-foreground" style="margin-top: 0.5rem; color: var(--text-secondary);">
			Browse projects, monorepo notes, and wiki cards from the vault.
		</p>
	</header>

	{#if data.docs.length === 0}
		<p style="color: var(--text-secondary);">No articles found. Run the sync script first.</p>
	{:else}
		<div class="docs-index-grid">
			{#each data.docs as post (post.href)}
				<a class="docs-card" href={post.href}>
					<span class="docs-card-title">{post.title}</span>
					{#if post.description}
						<span class="docs-card-desc">{post.description}</span>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</article>
