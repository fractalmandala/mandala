<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		content,
		side = 'top',
		delay = 400,
		children,
	}: {
		content: string;
		side?: 'top' | 'right' | 'bottom' | 'left';
		delay?: number;
		children: Snippet;
	} = $props();

	let open = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;
	let root: HTMLElement | null = $state(null);

	function clearTimer(): void {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function show(): void {
		clearTimer();
		timer = setTimeout(() => {
			open = true;
		}, delay);
	}

	function hide(): void {
		clearTimer();
		open = false;
	}
</script>

<span
	class="tooltip-root"
	bind:this={root}
	role="group"
	onmouseenter={show}
	onmouseleave={hide}
	onfocusin={show}
	onfocusout={hide}
>
	{@render children()}
	{#if open}
		<span class="tooltip" data-side={side} role="tooltip">
			{content}
			<span class="tooltip__arrow" aria-hidden="true"></span>
		</span>
	{/if}
</span>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.tooltip-root
		position: relative
		display: inline-flex
		align-items: center

	.tooltip
		position: absolute
		z-index: t.$z-tooltip
		max-width: 240px
		padding: 6px 8px
		border-radius: t.$radius-md
		background: var(--ok-ink)
		color: var(--ok-ink-inverse)
		font-size: t.$font-size-xs
		font-weight: 600
		line-height: 1.35
		box-shadow: var(--ok-shadow-md)
		pointer-events: none
		white-space: normal

		&[data-side='top']
			bottom: calc(100% + 8px)
			left: 50%
			transform: translateX(-50%)
			animation: tooltip-in-top t.$duration-fast t.$ease-out

		&[data-side='bottom']
			top: calc(100% + 8px)
			left: 50%
			transform: translateX(-50%)
			animation: tooltip-in-bottom t.$duration-fast t.$ease-out

		&[data-side='left']
			right: calc(100% + 8px)
			top: 50%
			transform: translateY(-50%)
			animation: tooltip-in-left t.$duration-fast t.$ease-out

		&[data-side='right']
			left: calc(100% + 8px)
			top: 50%
			transform: translateY(-50%)
			animation: tooltip-in-right t.$duration-fast t.$ease-out

		&__arrow
			position: absolute
			width: 8px
			height: 8px
			background: var(--ok-ink)
			transform: rotate(45deg)

		&[data-side='top'] &__arrow
			bottom: -4px
			left: 50%
			margin-left: -4px

		&[data-side='bottom'] &__arrow
			top: -4px
			left: 50%
			margin-left: -4px

		&[data-side='left'] &__arrow
			right: -4px
			top: 50%
			margin-top: -4px

		&[data-side='right'] &__arrow
			left: -4px
			top: 50%
			margin-top: -4px

	@keyframes tooltip-in-top
		from
			opacity: 0
			transform: translateX(-50%) translateY(4px)
		to
			opacity: 1
			transform: translateX(-50%) translateY(0)

	@keyframes tooltip-in-bottom
		from
			opacity: 0
			transform: translateX(-50%) translateY(-4px)
		to
			opacity: 1
			transform: translateX(-50%) translateY(0)

	@keyframes tooltip-in-left
		from
			opacity: 0
			transform: translateY(-50%) translateX(4px)
		to
			opacity: 1
			transform: translateY(-50%) translateX(0)

	@keyframes tooltip-in-right
		from
			opacity: 0
			transform: translateY(-50%) translateX(-4px)
		to
			opacity: 1
			transform: translateY(-50%) translateX(0)

	@media (prefers-reduced-motion: reduce)
		.tooltip
			animation: none
</style>
