<script lang="ts">
	import type { WorkspaceDocument } from '$lib/shell';

	let { document }: { document: WorkspaceDocument | undefined } = $props();
</script>

<section class="versions" aria-label="Version history">
	<header>
		<p>Version History</p>
		<h2>{document?.title ?? 'No document selected'}</h2>
	</header>

	{#if document && document.versions.length > 0}
		<div class="versions__list">
			{#each document.versions as version (version.id)}
				<article>
					<strong>{version.title}</strong>
					<span>{new Date(version.createdAt).toLocaleString()}</span>
					<pre>{version.content}</pre>
				</article>
			{/each}
		</div>
	{:else}
		<p class="versions__empty">No saved versions yet.</p>
	{/if}
</section>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.versions
		border: 1px solid var(--ok-line)
		border-radius: 8px
		padding: 24px
		background: var(--ok-panel)
		color: var(--ok-muted)

		header
			margin-bottom: 18px

			p
				margin: 0
				color: var(--ok-accent)
				font-size: 12px
				font-weight: 700
				text-transform: uppercase

			h2
				margin: 4px 0 0
				color: var(--ok-ink)

		&__list
			display: grid
			gap: 12px

			article
				border: 1px solid var(--ok-line)
				border-radius: 8px
				padding: 14px
				background: var(--ok-surface)

			strong,
			span
				display: block

			strong
				color: var(--ok-ink)

			span
				margin-top: 4px
				font-size: 12px

			pre
				max-height: 160px
				overflow: auto
				margin: 12px 0 0
				border: 1px solid var(--ok-line)
				border-radius: 8px
				padding: 12px
				background: var(--ok-panel)
				color: var(--ok-ink)
				white-space: pre-wrap

		&__empty
			margin: 0
</style>
