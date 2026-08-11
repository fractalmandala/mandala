<script lang="ts">
	import { formatLastUpdated, type ContentSummary } from '$lib/core/content';
	import { getEditUrl } from '$lib/site';
	import PageActions from '$lib/content/themes/docs/PageActions.svelte';
	import PageIcon from '$lib/icons/PageIcon.svelte';

	let { entry, html }: { entry: ContentSummary; html: string } = $props();
</script>

<article class="agentic-document">
	<header class="agentic-document-header">
		<p class="agentic-kicker">Documentation / {entry.slug}</p>
		<h1><PageIcon name={entry.icon} class="title-icon" />{entry.title}</h1>
		{#if entry.description}<p class="agentic-document-description">{entry.description}</p>{/if}
		<div class="agentic-document-meta"><span>{entry.readingTimeMinutes} min read</span><span>{entry.wordCount} words</span><PageActions slug={entry.slug} editHref={getEditUrl(entry.sourcePath)} /></div>
	</header>
	<div class="agentic-document-body">{@html html}</div>
	{#if entry.lastModified}<footer class="agentic-document-footer">Last updated on {formatLastUpdated(entry.lastModified)}</footer>{/if}
</article>
