<script lang="ts">
	/**
	 * Cold-load editor skeleton — the placeholder shown while a document's
	 * content is loading. Mirrors the reference `EditorSkeleton.tsx`: a heading
	 * bar plus two text lines laid out in the editor content column so the
	 * layout does not jump when the real document streams in.
	 *
	 * Self-contained: `label` in, nothing out. The animated bars pause under
	 * `prefers-reduced-motion`.
	 */
	let { label = 'Loading document' }: { label?: string } = $props();
</script>

<div class="editor-skeleton" role="status" aria-busy="true" aria-label={label}>
	<span class="editor-skeleton__line editor-skeleton__line--heading"></span>
	<span class="editor-skeleton__line editor-skeleton__line--full"></span>
	<span class="editor-skeleton__line editor-skeleton__line--partial"></span>
	<span class="editor-skeleton__sr">{label}</span>
</div>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.editor-skeleton
		display: flex
		flex-direction: column
		gap: t.$space-3
		width: 100%
		max-width: 46rem
		padding: t.$space-6 t.$space-4 0

		&__line
			display: block
			height: t.$space-2
			border-radius: t.$radius-sm
			background: var(--ok-panel-2)
			animation: editor-skeleton-pulse 1400ms t.$ease-in-out infinite

			&--heading
				height: t.$space-5
				width: 40%
				margin-bottom: t.$space-2

			&--full
				width: 100%

			&--partial
				width: 75%

		&__sr
			position: absolute
			width: 1px
			height: 1px
			padding: 0
			margin: -1px
			overflow: hidden
			clip: rect(0, 0, 0, 0)
			white-space: nowrap
			border: 0

	@keyframes editor-skeleton-pulse
		0%, 100%
			opacity: 1
		50%
			opacity: 0.4

	@media (prefers-reduced-motion: reduce)
		.editor-skeleton__line
			animation: none
</style>
