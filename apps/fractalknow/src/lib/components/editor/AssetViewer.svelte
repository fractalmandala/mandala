<script lang="ts">
	import type { WorkspaceDocument } from '$lib/shell';

	let { document }: { document: WorkspaceDocument } = $props();

	let metadata = $derived(
		document.metadata ?? {
			size: new TextEncoder().encode(document.content).length,
			extension: document.path.split('.').at(-1)?.toLowerCase() ?? '',
			mime: 'application/octet-stream',
			binary: document.kind === 'asset',
			large: false,
			updatedAt: '',
		},
	);
	let isImage = $derived(metadata.mime.startsWith('image/'));
	let imageFailed = $state(false);
	let imageSource = $derived(resolveImageSource(document.content));

	function formatBytes(size: number): string {
		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
		return `${(size / (1024 * 1024)).toFixed(1)} MB`;
	}

	function resolveImageSource(content: string): string | null {
		const trimmed = content.trim();
		if (/^(data:image\/|blob:|https?:\/\/|\/(?!\/)|\.\.?\/)/i.test(trimmed)) return trimmed;
		return null;
	}
</script>

<div class="asset-viewer" aria-label="Asset preview">
	<div class="asset-viewer__preview">
		{#if isImage && imageSource && !imageFailed}
			<img src={imageSource} alt={document.title} onerror={() => (imageFailed = true)} />
		{:else}
			<span>{metadata.extension.toUpperCase() || 'ASSET'}</span>
		{/if}
	</div>
	<div>
		<h3>{document.title}</h3>
		<p>{document.path}</p>
		<dl>
			<div>
				<dt>Media type</dt>
				<dd>{metadata.mime}</dd>
			</div>
			<div>
				<dt>Size</dt>
				<dd>{formatBytes(metadata.size)}</dd>
			</div>
			<div>
				<dt>Binary</dt>
				<dd>{metadata.binary ? 'Yes' : 'No'}</dd>
			</div>
			<div>
				<dt>Renderable</dt>
				<dd>{isImage && imageSource && !imageFailed ? 'Image preview' : 'Metadata preview only'}</dd>
			</div>
		</dl>
		{#if isImage && !imageSource}
			<p role="status">Image metadata is available, but no preview URL is attached yet.</p>
		{:else if imageFailed}
			<p role="alert">Image preview failed to load. Metadata remains available.</p>
		{:else}
			<p>{document.content}</p>
		{/if}
	</div>
</div>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.asset-viewer
		min-height: 320px
		border: 1px solid var(--ok-line)
		border-radius: 8px
		padding: 20px
		background: var(--ok-surface)
		display: grid
		grid-template-columns: 180px minmax(0, 1fr)
		gap: 18px
		color: var(--ok-muted)

		&__preview
			aspect-ratio: 1
			border: 1px solid var(--ok-line)
			border-radius: 8px
			background: var(--ok-panel)
			display: grid
			place-items: center
			color: var(--ok-accent)
			font-size: 28px
			font-weight: 800
			overflow: hidden

			img
				width: 100%
				height: 100%
				object-fit: contain

		h3
			margin: 0 0 8px
			color: var(--ok-ink)

		p
			margin: 0 0 8px

		dl
			margin: 14px 0
			display: grid
			grid-template-columns: repeat(2, minmax(0, 1fr))
			gap: 12px

		dt
			color: var(--ok-muted)
			font-size: 11px
			font-weight: 700
			text-transform: uppercase

		dd
			margin: 4px 0 0
			color: var(--ok-ink)
			overflow-wrap: anywhere
</style>
