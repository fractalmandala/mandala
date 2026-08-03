<script lang="ts">
	import FrontmatterInspector from '$lib/components/FrontmatterInspector.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.doc.frontmatter.title} — Fractalwiki</title>
	{#if data.doc.frontmatter.description}
		<meta name="description" content={data.doc.frontmatter.description} />
	{/if}
</svelte:head>

<div class="doc-layout row gap32 width100">
	<article class="doc-body flex-1 width100 min-w0">
		<FrontmatterInspector
			frontmatter={data.doc.frontmatter}
			currentGroup={data.doc.groupId}
			currentSection={data.doc.sectionId}
		/>

		<div class="markdown-content padtop16">
			{@html data.htmlContent}
		</div>
	</article>

	<TableOfContents headings={data.doc.headings} />
</div>


