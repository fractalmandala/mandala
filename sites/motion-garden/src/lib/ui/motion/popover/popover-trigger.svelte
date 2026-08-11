<script lang="ts">
	import { type Snippet } from 'svelte';
	import { getPopoverContext } from './popover-context.js';
	import './popover.sass';

	let { children }: { children: Snippet } = $props();

	const ctx = getPopoverContext('PopoverTrigger');

	// The child renders inside this span: Svelte has no cloneElement, so the
	// handlers/aria live on the wrapper. An inline span hugs the child, and the
	// child's own click still bubbles here, so defaultPrevented composes like
	// the React original.
	let triggerEl: HTMLElement | null = null;
	$effect(() => {
		ctx.triggerRef.current = triggerEl;
		return () => {
			ctx.triggerRef.current = null;
		};
	});

	function compose(event: Event, handler: () => void) {
		if (!event.defaultPrevented) handler();
	}

	function handleKeydown(event: KeyboardEvent) {
		// Only act when the wrapper itself is focused: real interactive children
		// (buttons, links) fire their own click, which bubbles here and would
		// double-toggle if we also handled Enter/Space.
		if (event.target !== triggerEl) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			ctx.toggle();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions — Svelte has no
     cloneElement, so the click/keydown + aria live on this wrapper span; the
     child (a Button) is the real focusable element and receives keyboard
     activation itself. The keydown guard above prevents double toggles. -->
<span
	bind:this={triggerEl}
	data-slot="popover-trigger"
	aria-haspopup="dialog"
	aria-expanded={ctx.open}
	aria-controls={ctx.open ? ctx.contentId : undefined}
	data-state={ctx.open ? 'open' : 'closed'}
	onclick={ctx.triggerMode === 'click' ? (e) => compose(e, ctx.toggle) : undefined}
	onkeydown={ctx.triggerMode === 'click' ? handleKeydown : undefined}
	onfocus={ctx.triggerMode === 'hover' ? (e) => compose(e, ctx.openHover) : undefined}
	onblur={ctx.triggerMode === 'hover' ? (e) => compose(e, ctx.scheduleClose) : undefined}
>
	{@render children()}
</span>
