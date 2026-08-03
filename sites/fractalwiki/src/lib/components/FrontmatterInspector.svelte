<script lang="ts">
	import type { DocFrontmatter } from '$lib/server/vault';

	let { frontmatter, currentGroup, currentSection }: { frontmatter: DocFrontmatter; currentGroup: string; currentSection: string } = $props();
</script>

<div class="frontmatter-inspector pad20 marginbot24 radius8 bdr">
	<div class="flex-col gap8">
		<h1 class="doc-title text-2xl text-bold">{frontmatter.title}</h1>

		{#if frontmatter.description}
			<p class="doc-desc text-base text-secondary">{frontmatter.description}</p>
		{/if}

		<div class="meta-row row wrap ycenter gap16 margintop8 padtop12 bdr-top text-xs">
			{#if frontmatter.timestamp}
				<div class="meta-item row ycenter gap4 text-tertiary">
					<span>📅</span>
					<span>{frontmatter.timestamp}</span>
				</div>
			{/if}

			{#if frontmatter.tags && frontmatter.tags.length > 0}
				<div class="meta-item row ycenter gap4 flex-wrap">
					<span class="text-tertiary">Tags:</span>
					{#each frontmatter.tags as tag}
						<span class="tag-chip pad2 padleft8 padright8 radius12 text-xs">{tag}</span>
					{/each}
				</div>
			{/if}

			{#if frontmatter.sources && frontmatter.sources.length > 0}
				<div class="meta-item row ycenter gap4">
					<span class="text-tertiary">Sources:</span>
					{#each frontmatter.sources as source}
						<span class="source-chip pad2 padleft6 padright6 radius4 text-xs">📄 {source}</span>
					{/each}
				</div>
			{/if}
		</div>

		{#if frontmatter.related && frontmatter.related.length > 0}
			<div class="related-section margintop8 padtop8 bdr-top text-xs">
				<span class="text-tertiary text-bold marginright8">Related Concepts:</span>
				<div class="row wrap gap8 inline-flex">
					{#each frontmatter.related as item}
						<a href="/{currentGroup}/{currentSection}/{item}" class="related-link text-accent">
							{item}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>


