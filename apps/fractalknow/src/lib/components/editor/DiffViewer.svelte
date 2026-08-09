<script lang="ts">
	import type { WorkspaceDocument } from '$lib/shell';
	import { diffLines } from 'diff';

	let {
		document,
		compareTo,
	}: {
		document: WorkspaceDocument;
		compareTo?: string | null;
	} = $props();

	let base = $derived(compareTo ?? document.lastSavedContent ?? '');
	let current = $derived(document.content);
	let parts = $derived(diffLines(base, current));
	let stats = $derived({
		added: parts.filter((part) => part.added).reduce((sum, part) => sum + part.count, 0),
		removed: parts.filter((part) => part.removed).reduce((sum, part) => sum + part.count, 0),
	});
</script>

<section class="diff-viewer" aria-label="Document diff">
	<header>
		<div>
			<h3>Diff</h3>
			<p>{document.title} — last saved vs current buffer</p>
		</div>
		<div class="diff-viewer__stats">
			<span data-tone="ok">+{stats.added}</span>
			<span data-tone="danger">-{stats.removed}</span>
		</div>
	</header>
	{#if base === current}
		<p class="diff-viewer__empty">No changes from last saved content.</p>
	{:else}
		<pre class="diff-viewer__body"><code
			>{#each parts as part, index (index)}{#if part.added}<span class="diff-viewer__add">{part.value}</span>{:else if part.removed}<span class="diff-viewer__del">{part.value}</span>{:else}<span class="diff-viewer__ctx">{part.value}</span>{/if}{/each}</code
			></pre>
	{/if}
</section>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.diff-viewer
		min-height: 320px
		border: 1px solid var(--ok-line)
		border-radius: 8px
		background: var(--ok-surface)
		color: var(--ok-ink)
		overflow: hidden

		header
			display: flex
			justify-content: space-between
			gap: 12px
			padding: 14px 16px
			border-bottom: 1px solid var(--ok-line)
			background: var(--ok-panel)

			h3, p
				margin: 0

			p
				margin-top: 4px
				color: var(--ok-muted)
				font-size: 12px

		&__stats
			display: flex
			gap: 10px
			font-weight: 800

			[data-tone='ok']
				color: var(--ok-success)

			[data-tone='danger']
				color: var(--ok-danger)

		&__empty
			padding: 20px
			color: var(--ok-muted)

		&__body
			margin: 0
			padding: 12px 0
			max-height: 520px
			overflow: auto
			font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
			font-size: 12px
			line-height: 1.5
			white-space: pre-wrap

		&__add
			display: block
			background: var(--ok-diff-added)
			color: inherit

		&__del
			display: block
			background: var(--ok-diff-removed)
			color: inherit

		&__ctx
			display: block
			background: var(--ok-diff-context)
			color: var(--ok-muted)
</style>
