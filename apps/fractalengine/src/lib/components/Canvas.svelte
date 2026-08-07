<script lang="ts">
	import { onMount } from 'svelte';
	import { canvas } from '../state/canvas.svelte';
	import Tile from './Tile.svelte';
	import Minimap from './Minimap.svelte';
	import TileDock from './TileDock.svelte';

	let boardEl = $state<HTMLElement | null>(null);
	let isSpacePressed = $state(false);
	let isPanning = $state(false);
	let wheelGestureTimer: ReturnType<typeof setTimeout> | null = null;

	let startX = 0;
	let startY = 0;
	let viewportStartX = 0;
	let viewportStartY = 0;

	function isTypingTarget(el: Element | null): boolean {
		return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.hasAttribute('contenteditable'));
	}

	// Keyboard equivalents for the pointer-only pan (drag) and wheel-zoom gestures below —
	// arrow keys pan the viewport, +/- zoom, both ignored while typing in a field.
	const PAN_STEP = 40;
	const ZOOM_FACTOR = 1.1;
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && canvas.focusedId) {
			canvas.focusTile(null);
			e.preventDefault();
			return;
		}

		if (e.code === 'Space' && !isSpacePressed) {
			if (isTypingTarget(document.activeElement)) return;
			isSpacePressed = true;
			e.preventDefault();
			return;
		}

		if (isTypingTarget(document.activeElement)) return;

		if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			if (document.activeElement !== boardEl) return;
			e.preventDefault();
			canvas.pushUndo();
			if (e.key === 'ArrowLeft') canvas.viewport.x += PAN_STEP;
			else if (e.key === 'ArrowRight') canvas.viewport.x -= PAN_STEP;
			else if (e.key === 'ArrowUp') canvas.viewport.y += PAN_STEP;
			else canvas.viewport.y -= PAN_STEP;
			canvas.saveLayout();
		} else if ((e.key === '+' || e.key === '=' || e.key === '-') && document.activeElement === boardEl) {
			e.preventDefault();
			canvas.pushUndo();
			const oldZoom = canvas.viewport.zoom;
			const newZoom = Math.max(0.4, Math.min(2.0, e.key === '-' ? oldZoom / ZOOM_FACTOR : oldZoom * ZOOM_FACTOR));
			canvas.viewport.zoom = newZoom;
			canvas.saveLayout();
		}
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (e.code === 'Space') {
			isSpacePressed = false;
		}
	}

	function resetTransientInput() {
		isSpacePressed = false;
		if (isPanning) {
			isPanning = false;
			canvas.endGesture();
		}
		if (wheelGestureTimer) {
			clearTimeout(wheelGestureTimer);
			wheelGestureTimer = null;
			canvas.endGesture();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('blur', resetTransientInput);
		// Layout loading now happens once, centrally, from ide.svelte.ts's initWorkspace()
		// after rootPath is settled — see the comment there. Calling canvas.loadLayout() here
		// too would race ahead of that and read the wrong (stale, non-project-scoped) source.

		return () => {
			resetTransientInput();
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('blur', resetTransientInput);
		};
	});

	function handlePointerDown(e: PointerEvent) {
		const target = e.target as HTMLElement;
		const isTileClick = target.closest('.tile');
		const isDockClick = target.closest('.tile-dock');
		const isMinimapClick = target.closest('.minimap');
		if (isTileClick || isDockClick || isMinimapClick) return;

		// Pan with left-click + Space or middle-click
		const canPan = (e.button === 0 && isSpacePressed) || e.button === 1;
		if (!canPan) return;

		isPanning = true;
		canvas.beginGesture();
		startX = e.clientX;
		startY = e.clientY;
		viewportStartX = canvas.viewport.x;
		viewportStartY = canvas.viewport.y;

		boardEl?.setPointerCapture(e.pointerId);
		e.preventDefault();
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isPanning) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		canvas.viewport.x = viewportStartX + dx;
		canvas.viewport.y = viewportStartY + dy;
		canvas.saveLayout();
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isPanning) return;
		isPanning = false;
		if (boardEl?.hasPointerCapture(e.pointerId)) boardEl.releasePointerCapture(e.pointerId);
		canvas.endGesture();
	}

	function handleWheel(e: WheelEvent) {
		canvas.beginGesture();
		if (wheelGestureTimer) clearTimeout(wheelGestureTimer);
		wheelGestureTimer = setTimeout(() => {
			wheelGestureTimer = null;
			canvas.endGesture();
		}, 150);
		// Zoom if ctrl/cmd key is active
		const isZoom = e.ctrlKey || e.metaKey;

		if (isZoom) {
			e.preventDefault();
			const zoomFactor = 1.1;
			const direction = e.deltaY < 0 ? 1 : -1;
			const oldZoom = canvas.viewport.zoom;
			let newZoom = direction > 0 ? oldZoom * zoomFactor : oldZoom / zoomFactor;

			newZoom = Math.max(0.4, Math.min(2.0, newZoom));

			const rect = boardEl!.getBoundingClientRect();
			const mx = e.clientX - rect.left;
			const my = e.clientY - rect.top;

			const bx = (mx - canvas.viewport.x) / oldZoom;
			const by = (my - canvas.viewport.y) / oldZoom;

			canvas.viewport.zoom = newZoom;
			canvas.viewport.x = mx - bx * newZoom;
			canvas.viewport.y = my - by * newZoom;
			canvas.saveLayout();
		} else {
			// Normal wheel scroll pans
			canvas.viewport.x -= e.deltaX;
			canvas.viewport.y -= e.deltaY;
			canvas.saveLayout();
		}
	}
</script>

<!--
	role="application" is the correct ARIA pattern for a custom canvas that manages its own
	keyboard interaction (see handleKeyDown above) — Svelte's a11y checker doesn't recognize
	it as an interactive role, hence the ignore below.
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={boardEl}
	class="board-region w100 h100"
	class:grabbing={isPanning}
	class:grab={isSpacePressed && !isPanning}
	class:has-focused={canvas.focusedId !== null}
	style="background-position: {canvas.viewport.x}px {canvas.viewport.y}px; background-size: {22 *
		canvas.viewport.zoom}px {22 * canvas.viewport.zoom}px;"
	role="application"
	tabindex="0"
	aria-label="Design canvas. Use arrow keys to pan, +/- to zoom, Escape to exit a focused tile."
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	onwheel={handleWheel}
>
	<div
		class="canvas-viewport"
		style="transform: translate({canvas.viewport.x}px, {canvas.viewport.y}px) scale({canvas.viewport.zoom});"
	>
		{#each canvas.tiles as tile (tile.id)}
			{#if canvas.focusedId !== tile.id}
				<Tile {tile} />
			{/if}
		{/each}
	</div>

	{#if canvas.focusedId}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="canvas-focus-overlay" onclick={() => canvas.focusTile(null)}></div>
		{#each canvas.tiles as tile (tile.id)}
			{#if canvas.focusedId === tile.id}
				<Tile {tile} />
			{/if}
		{/each}
	{/if}

	<TileDock />
	<Minimap />
</div>
