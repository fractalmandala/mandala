<script lang="ts">
	import { tick } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { isDrawerOpen, closeDrawer, theme } from '$lib/utils/globalstores';

	let { children } = $props();

	let panelEl = $state<HTMLElement | null>(null);
	let height = $state(540);
	let resizing = $state(false);
	const MIN_H = 200;

	// --- Drag-to-resize (grab the top edge) ---
	function onResizeStart(e: PointerEvent) {
		e.preventDefault();
		resizing = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onResizeMove(e: PointerEvent) {
		if (!resizing) return;
		// Bottom drawer: top edge sits at (viewport height - drawer height).
		// Dragging up (smaller clientY) makes it taller.
		const max = window.innerHeight * 0.9;
		height = Math.min(max, Math.max(MIN_H, window.innerHeight - e.clientY));
	}
	function onResizeEnd(e: PointerEvent) {
		resizing = false;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* capture already released */
		}
	}

	// --- Scroll lock + restore focus on open/close ---
	$effect(() => {
		if (!$isDrawerOpen) return;
		const prevFocused = document.activeElement as HTMLElement | null;
		document.body.style.overflow = 'hidden';
		tick().then(() => panelEl?.focus()); // focus the panel once it's mounted
		return () => {
			document.body.style.overflow = '';
			prevFocused?.focus?.();
		};
	});

	// --- Focus trap + Escape (window-level so it works regardless of focus) ---
	function focusables(): HTMLElement[] {
		if (!panelEl) return [];
		return Array.from(
			panelEl.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => el.offsetParent !== null);
	}

	function onWindowKeydown(e: KeyboardEvent) {
		if (!$isDrawerOpen) return;
		if (e.key === 'Escape') {
			closeDrawer();
			return;
		}
		if (e.key !== 'Tab') return;
		const items = focusables();
		if (items.length === 0) {
			e.preventDefault();
			panelEl?.focus();
			return;
		}
		const first = items[0];
		const last = items[items.length - 1];
		const active = document.activeElement;
		if (e.shiftKey && (active === first || active === panelEl)) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && active === last) {
			e.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#if $isDrawerOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="drawer-backdrop {$theme}" transition:fade={{ duration: 200 }} onclick={closeDrawer} aria-hidden="true"></div>

	<div
		bind:this={panelEl}
		class="drawer-panel"
		class:resizing
		style="height: {height}px"
		role="dialog"
		aria-modal="true"
		aria-label="Menu"
		tabindex="-1"
		transition:fly={{ y: height, duration: 280, opacity: 1, easing: cubicOut }}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="drawer-resize"
			role="separator"
			aria-orientation="horizontal"
			aria-label="Resize drawer"
			onpointerdown={onResizeStart}
			onpointermove={onResizeMove}
			onpointerup={onResizeEnd}
			onpointercancel={onResizeEnd}
		></div>

		<div class="drawer-header">
			<h2>Menu</h2>
			<button class="drawer-close" onclick={closeDrawer} aria-label="Close menu">✕</button>
		</div>
		<nav class="drawer-content">
			{@render children()}
		</nav>
	</div>
{/if}
