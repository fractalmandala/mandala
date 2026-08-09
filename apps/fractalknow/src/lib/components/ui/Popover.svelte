<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { restoreFocus, trapFocus } from './focus-trap';

	let {
		open = $bindable(false),
		label = 'Popover',
		align = 'start',
		trigger,
		children,
	}: {
		open?: boolean;
		label?: string;
		align?: 'start' | 'end';
		trigger: Snippet<[{ toggle: () => void; open: boolean }]>;
		children: Snippet<[{ close: () => void }]>;
	} = $props();

	let panel: HTMLElement | null = $state(null);
	let previousFocus: Element | null = null;
	let releaseTrap: (() => void) | null = null;

	function toggle(): void {
		open = !open;
	}

	function close(): void {
		open = false;
	}

	function onDocumentPointer(event: MouseEvent): void {
		if (!open || !panel) return;
		const target = event.target;
		if (target instanceof Node && panel.contains(target)) return;
		// Allow trigger clicks to toggle without immediately reopening.
		if (target instanceof Element && target.closest('[data-popover-trigger]')) return;
		close();
	}

	function onKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && open) {
			event.preventDefault();
			event.stopPropagation();
			close();
		}
	}

	$effect(() => {
		if (!open) {
			releaseTrap?.();
			releaseTrap = null;
			restoreFocus(previousFocus);
			previousFocus = null;
			return;
		}
		previousFocus = document.activeElement;
		queueMicrotask(() => {
			if (panel) releaseTrap = trapFocus(panel);
		});
	});

	onMount(() => {
		document.addEventListener('mousedown', onDocumentPointer);
		document.addEventListener('keydown', onKeydown);
		return () => {
			document.removeEventListener('mousedown', onDocumentPointer);
			document.removeEventListener('keydown', onKeydown);
			releaseTrap?.();
		};
	});
</script>

<div class="popover" data-align={align}>
	<div class="popover__trigger" data-popover-trigger>
		{@render trigger({ toggle, open })}
	</div>
	{#if open}
		<div
			class="popover__panel"
			bind:this={panel}
			role="dialog"
			aria-label={label}
			aria-modal="false"
			tabindex="-1"
		>
			{@render children({ close })}
		</div>
	{/if}
</div>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.popover
		position: relative
		display: inline-flex

		&[data-align='end'] .popover__panel
			right: 0
			left: auto

		&__panel
			position: absolute
			top: calc(100% + 6px)
			left: 0
			z-index: t.$z-popover
			min-width: 220px
			max-width: min(320px, 90vw)
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-lg
			background: var(--ok-panel)
			box-shadow: var(--ok-shadow-lg)
			padding: 6px
			animation: popover-in t.$duration-fast t.$ease-out

	@keyframes popover-in
		from
			opacity: 0
			transform: translateY(-4px)
		to
			opacity: 1
			transform: translateY(0)

	@media (prefers-reduced-motion: reduce)
		.popover__panel
			animation: none
</style>
