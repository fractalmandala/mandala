<script lang="ts">
	import { dismissToast, toasts, type ToastKind } from '$lib/shell';
	import Icon from '$lib/icons/Icon.svelte';
	import type { IconName } from '$lib/icons/types';

	function toneIcon(kind: ToastKind): IconName {
		if (kind === 'success') return 'check-circle';
		if (kind === 'warning' || kind === 'danger') return 'alert-triangle';
		return 'info';
	}

	function prefersReducedMotion(): boolean {
		return (
			typeof window !== 'undefined' &&
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}
</script>

<div class="toast-host" aria-live="polite" aria-relevant="additions text" aria-atomic="false">
	{#each $toasts as toast (toast.id)}
		<article
			class="toast"
			class:reduced={prefersReducedMotion()}
			data-kind={toast.kind}
			role="status"
		>
			<span class="toast__icon" aria-hidden="true">
				<Icon name={toneIcon(toast.kind)} size={14} />
			</span>
			<div class="toast__body">
				<strong>{toast.title}</strong>
				{#if toast.body}
					<p>{toast.body}</p>
				{/if}
			</div>
			<button type="button" aria-label="Dismiss notification" onclick={() => dismissToast(toast.id)}>
				<Icon name="x" size={12} />
			</button>
		</article>
	{/each}
</div>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.toast-host
		position: fixed
		right: 16px
		bottom: 16px
		z-index: t.$z-toast
		display: grid
		gap: 8px
		width: min(360px, calc(100vw - 24px))
		pointer-events: none

	.toast
		pointer-events: auto
		display: grid
		grid-template-columns: auto minmax(0, 1fr) auto
		gap: 10px
		align-items: start
		border: 1px solid var(--ok-line)
		border-radius: t.$radius-lg
		padding: 10px 12px
		background: var(--ok-panel)
		box-shadow: var(--ok-shadow-lg)
		color: var(--ok-ink)
		animation: toast-in t.$duration-base t.$ease-out

		&.reduced
			animation: none

		&[data-kind='success']
			border-color: var(--ok-success)

		&[data-kind='warning']
			border-color: var(--ok-warn)

		&[data-kind='danger']
			border-color: var(--ok-danger)

		&[data-kind='info']
			border-color: var(--ok-accent)

		&__icon
			margin-top: 2px
			color: var(--ok-accent)

		&[data-kind='success'] &__icon
			color: var(--ok-success)

		&[data-kind='warning'] &__icon
			color: var(--ok-warn)

		&[data-kind='danger'] &__icon
			color: var(--ok-danger)

		&__body
			min-width: 0

			strong
				display: block
				font-size: t.$font-size-sm

			p
				margin: 4px 0 0
				color: var(--ok-muted)
				font-size: t.$font-size-xs

		button
			border: 0
			background: transparent
			color: var(--ok-muted)
			cursor: pointer
			padding: 2px

	@keyframes toast-in
		from
			opacity: 0
			transform: translateY(8px)
		to
			opacity: 1
			transform: translateY(0)

	@media (prefers-reduced-motion: reduce)
		.toast
			animation: none
</style>
