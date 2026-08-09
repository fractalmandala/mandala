<script lang="ts">
	import { onMount } from 'svelte';
	import type { WorkspaceDocument } from '$lib/shell';
	import { renderMarkdownResult } from './markdown';

	let { document }: { document: WorkspaceDocument } = $props();
	let container: HTMLElement;
	let result = $derived(renderMarkdownResult(document.content));
	let mermaidError = $state<string | null>(null);

	async function renderMermaid(): Promise<void> {
		if (!container || !result.features.mermaid) return;
		mermaidError = null;
		try {
			const mermaid = (await import('mermaid')).default;
			mermaid.initialize({
				startOnLoad: false,
				securityLevel: 'strict',
				theme: 'neutral',
			});
			const mounts = container.querySelectorAll<HTMLElement>('[data-mermaid-target]');
			let index = 0;
			for (const mount of mounts) {
				const figure = mount.closest('.mermaid-figure');
				const source = figure?.getAttribute('data-mermaid-source') ?? '';
				if (!source) continue;
				const id = `fk-mermaid-${Date.now()}-${index}`;
				index += 1;
				const { svg } = await mermaid.render(id, source);
				mount.innerHTML = svg;
			}
		} catch (error) {
			mermaidError = error instanceof Error ? error.message : 'Mermaid render failed.';
		}
	}

	onMount(() => {
		void renderMermaid();
	});

	$effect(() => {
		// Re-run when document content changes.
		void result.html;
		queueMicrotask(() => {
			void renderMermaid();
		});
	});
</script>

<article class="markdown-viewer" aria-label="Markdown preview" bind:this={container}>
	{#if result.error}
		<div class="markdown-viewer__error" role="alert">
			<h3>Preview failed</h3>
			<p>{result.error}</p>
		</div>
	{:else}
		{#if result.features.mdxFallback}
			<p class="markdown-viewer__notice">MDX content is shown as escaped source in preview.</p>
		{/if}
		{#if result.features.mermaid}
			<p class="markdown-viewer__notice">Mermaid diagrams are rendered below when the grammar is valid.</p>
		{/if}
		{#if mermaidError}
			<p class="markdown-viewer__notice" role="status">Mermaid: {mermaidError}</p>
		{/if}
		{@html result.html}
	{/if}
</article>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.markdown-viewer
		width: 100%
		min-height: 320px
		border: 1px solid var(--ok-line)
		border-radius: 8px
		padding: 20px
		background: var(--ok-surface)
		color: var(--ok-ink)
		line-height: 1.65
		overflow: auto

		&__notice
			margin: 0 0 12px
			border: 1px solid var(--ok-line)
			border-radius: 6px
			padding: 8px 10px
			background: var(--ok-panel)
			color: var(--ok-muted)
			font-size: 12px
			font-weight: 700

		&__error
			border: 1px solid var(--ok-danger)
			border-radius: 8px
			padding: 14px
			background: var(--ok-panel)
			color: var(--ok-muted)

			h3
				margin: 0 0 8px
				color: var(--ok-ink)

			p
				margin: 0

		:global(h1),
		:global(h2),
		:global(h3)
			margin: 0 0 12px
			color: var(--ok-ink)

		:global(p)
			margin: 0 0 12px

		:global(pre)
			overflow: auto
			border: 1px solid var(--ok-line)
			border-radius: 8px
			padding: 12px
			background: var(--ok-panel)

		:global(code)
			font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace

		:global(a)
			color: var(--ok-accent)

		:global(a[target='_blank'])
			text-decoration-thickness: 2px

		:global(img)
			display: block
			max-width: 100%
			max-height: 420px
			border: 1px solid var(--ok-line)
			border-radius: 8px
			object-fit: contain
			background: var(--ok-panel)

		:global(.mermaid-figure)
			margin: 0 0 16px
			border: 1px solid var(--ok-line)
			border-radius: 8px
			padding: 12px
			background: var(--ok-panel)

		:global(.mermaid-figure figcaption)
			margin: 8px 0
			color: var(--ok-muted)
			font-size: 12px
			font-weight: 700
			text-transform: uppercase

		:global(.mermaid-mount)
			overflow: auto
			text-align: center

		:global(.mermaid-mount svg)
			max-width: 100%
			height: auto
</style>
