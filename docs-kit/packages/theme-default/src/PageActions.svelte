<script lang="ts">
	let {
		pathname,
		siteUrl,
		markdownUrl,
		title
	}: { pathname: string; siteUrl?: string; markdownUrl?: string; title?: string } = $props();

	let copied = $state(false);

	const absolute = $derived(() => {
		if (siteUrl === undefined) {
			return undefined;
		}
		try {
			return new URL(pathname, siteUrl).toString();
		} catch {
			return undefined;
		}
	});

	async function copyMarkdown() {
		if (markdownUrl === undefined) {
			return;
		}

		const response = await fetch(markdownUrl);
		await navigator.clipboard.writeText(await response.text());
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="docs-page-actions">
	{#if markdownUrl}
		<button type="button" class="docs-button" onclick={copyMarkdown}>
			{copied ? 'Copied' : 'Copy as Markdown'}
		</button>
		<a class="docs-button" href={markdownUrl}>View Markdown</a>
	{/if}
	{#if absolute()}
		<a
			class="docs-button"
			href="https://claude.ai/new?q={encodeURIComponent(`Read ${absolute()} and answer questions about ${title ?? 'this page'}.`)}"
			rel="noreferrer"
			target="_blank"
		>
			Open in Claude
		</a>
	{/if}
</div>
