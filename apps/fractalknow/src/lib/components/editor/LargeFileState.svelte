<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { DOCUMENT_OPEN_BYTE_LIMIT, largeFileState } from '$lib/editor/large-file';

	/**
	 * Notice shown in place of the editor when a document is too large to open
	 * (see `$lib/editor/large-file`). Adapts the reference
	 * `LargeFileEditorState.tsx`: same warning framing and formatted-size copy,
	 * but instead of a hard block it offers a **read-only** view of the
	 * oversized file, plus an optional back action.
	 *
	 * Self-contained — everything comes in via props and leaves via the
	 * `onViewReadOnly` / `onGoBack` callbacks; the component touches no store.
	 */
	type Props = {
		docName: string;
		size: number;
		limit?: number;
		/** Show the secondary "Go back" action. */
		canGoBack?: boolean;
		/** Document the back action returns to; passed to `onGoBack`. */
		previousDocName?: string;
		/** Invoked when the user chooses to open the file read-only. */
		onViewReadOnly?: () => void;
		/** Invoked with `previousDocName` when the user goes back. */
		onGoBack?: (previousDocName: string) => void;
	};

	let {
		docName,
		size,
		limit = DOCUMENT_OPEN_BYTE_LIMIT,
		canGoBack = false,
		previousDocName = '',
		onViewReadOnly,
		onGoBack,
	}: Props = $props();

	const fileState = $derived(largeFileState(size, limit));

	let viewButton = $state<HTMLButtonElement | null>(null);
	let backButton = $state<HTMLButtonElement | null>(null);
	let heading = $state<HTMLHeadingElement | null>(null);

	onMount(() => {
		// Focus the primary action so keyboard users land on the read-only
		// affordance; fall back to the back button, then the heading (parity
		// with the reference's focus handling).
		void tick().then(() => {
			(viewButton ?? backButton ?? heading)?.focus();
		});
	});

	function handleViewReadOnly(): void {
		onViewReadOnly?.();
	}

	function handleGoBack(): void {
		onGoBack?.(previousDocName);
	}
</script>

<div
	class="large-file"
	role="status"
	aria-labelledby="large-file-title"
	data-slot="large-file-editor-state"
>
	<div class="large-file__icon" aria-hidden="true">
		<Icon name="alert-triangle" size={32} />
	</div>
	<div class="large-file__text">
		<h2 id="large-file-title" class="large-file__title" tabindex="-1" bind:this={heading}>
			File too large to open
		</h2>
		<p class="large-file__detail">
			{docName} is {fileState.formattedSize}. FractalKnow currently opens files up to
			{fileState.formattedLimit}.
		</p>
	</div>
	<div class="large-file__actions">
		<button
			type="button"
			class="large-file__button large-file__button--primary"
			onclick={handleViewReadOnly}
			bind:this={viewButton}
		>
			<Icon name="eye" size={16} />
			<span>View read-only</span>
		</button>
		{#if canGoBack}
			<button
				type="button"
				class="large-file__button"
				onclick={handleGoBack}
				bind:this={backButton}
			>
				<Icon name="chevron-right" size={16} />
				<span>Go back</span>
			</button>
		{/if}
	</div>
</div>

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.large-file
		display: flex
		flex-direction: column
		align-items: center
		justify-content: center
		gap: t.$space-5
		height: 100%
		padding: t.$space-8
		text-align: center

		&__icon
			display: flex
			align-items: center
			justify-content: center
			width: t.$space-8
			height: t.$space-8
			border-radius: t.$radius-pill
			border: 1px solid var(--ok-line)
			background: var(--ok-panel-2)
			color: var(--ok-warn)

		&__text
			display: flex
			flex-direction: column
			align-items: center
			gap: t.$space-1

		&__title
			margin: 0
			font-size: t.$font-size-xl
			font-weight: 300
			color: var(--ok-ink)
			outline: none

		&__detail
			margin: 0
			max-width: 28rem
			font-size: t.$font-size-sm
			color: var(--ok-muted)

		&__actions
			display: flex
			flex-wrap: wrap
			align-items: center
			justify-content: center
			gap: t.$space-2

		&__button
			display: inline-flex
			align-items: center
			gap: t.$space-2
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-2 t.$space-3
			background: var(--ok-panel)
			color: var(--ok-ink)
			font-size: t.$font-size-sm
			cursor: pointer
			@include m.hover-transition(background-color)
			@include m.press-feedback

			&:hover
				background: var(--ok-highlight)

			&:focus-visible
				@include m.focus-ring(2px, 2px)

			&--primary
				border-color: var(--ok-accent)
				background: var(--ok-accent)
				color: var(--ok-ink-inverse)

				&:hover
					background: var(--ok-accent)
					opacity: 0.9
</style>
