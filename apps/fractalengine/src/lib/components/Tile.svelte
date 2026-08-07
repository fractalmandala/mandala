<script lang="ts">
	import { TILE_KINDS } from '../data/tileKinds';
	import { canvas, type Tile } from '../state/canvas.svelte';

	interface Props {
		tile: Tile;
	}

	let { tile }: Props = $props();

	const meta = $derived(TILE_KINDS[tile.kind]);
	const Body = $derived(meta?.component);

	let isDragging = $state(false);
	let isResizing = $state(false);

	let dragStartX = 0;
	let dragStartY = 0;
	let tileStartX = 0;
	let tileStartY = 0;

	let resizeStartW = 0;
	let resizeStartH = 0;

	function handlePointerDown(e: PointerEvent) {
		// Raise stacking order immediately
		canvas.raise(tile.id);
	}

	function startDrag(e: PointerEvent) {
		// Only drag with left mouse button
		if (e.button !== 0) return;
		
		// Avoid dragging when clicking action buttons
		if ((e.target as HTMLElement).closest('.tile-actions')) return;

		isDragging = true;
		canvas.beginGesture();
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		tileStartX = tile.x;
		tileStartY = tile.y;

		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		e.preventDefault();
	}

	function handleDragMove(e: PointerEvent) {
		if (!isDragging) return;

		const zoom = canvas.viewport.zoom;
		const dx = (e.clientX - dragStartX) / zoom;
		const dy = (e.clientY - dragStartY) / zoom;

		canvas.moveTile(tile.id, tileStartX + dx, tileStartY + dy);
	}

	function stopDrag(e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		const target = e.target as HTMLElement;
		if (target.hasPointerCapture(e.pointerId)) target.releasePointerCapture(e.pointerId);
		canvas.endGesture();
	}

	function startResize(e: PointerEvent) {
		if (e.button !== 0) return;

		isResizing = true;
		canvas.beginGesture();
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		resizeStartW = tile.w;
		resizeStartH = tile.h;

		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		e.preventDefault();
		e.stopPropagation();
	}

	function handleResizeMove(e: PointerEvent) {
		if (!isResizing) return;

		const zoom = canvas.viewport.zoom;
		const dx = (e.clientX - dragStartX) / zoom;
		const dy = (e.clientY - dragStartY) / zoom;

		canvas.resizeTile(tile.id, resizeStartW + dx, resizeStartH + dy);
	}

	function stopResize(e: PointerEvent) {
		if (!isResizing) return;
		isResizing = false;
		const target = e.target as HTMLElement;
		if (target.hasPointerCapture(e.pointerId)) target.releasePointerCapture(e.pointerId);
		canvas.endGesture();
	}

	// Keyboard equivalent for dragging: arrow keys nudge the tile, Shift+arrow moves in
	// bigger steps. The header is the drag handle, so that's where focus/keydown live.
	const NUDGE_STEP = 8;
	const NUDGE_STEP_LARGE = 32;
	function handleHeaderKeyDown(e: KeyboardEvent) {
		const step = e.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP;
		let dx = 0, dy = 0;
		if (e.key === 'ArrowLeft') dx = -step;
		else if (e.key === 'ArrowRight') dx = step;
		else if (e.key === 'ArrowUp') dy = -step;
		else if (e.key === 'ArrowDown') dy = step;
		else return;
		e.preventDefault();
		canvas.pushUndo();
		canvas.moveTile(tile.id, tile.x + dx, tile.y + dy);
	}

	function handleResizeKeyDown(e: KeyboardEvent) {
		const step = e.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP;
		let dw = 0, dh = 0;
		if (e.key === 'ArrowLeft') dw = -step;
		else if (e.key === 'ArrowRight') dw = step;
		else if (e.key === 'ArrowUp') dh = -step;
		else if (e.key === 'ArrowDown') dh = step;
		else return;
		e.preventDefault();
		canvas.pushUndo();
		canvas.resizeTile(tile.id, tile.w + dw, tile.h + dh);
	}
</script>

<section
	class="tile box"
	class:active={canvas.activeId === tile.id}
	style="left:{tile.x}px; top:{tile.y}px; width:{tile.w}px; height:{tile.h}px; z-index:{tile.z};"
	role="presentation"
	onpointerdown={handlePointerDown}
>
	<header
		class="tile-head row ycenter"
		role="button"
		tabindex="0"
		aria-label="Drag to move {meta?.label || 'tile'}. Use arrow keys to move, hold Shift for larger steps."
		onpointerdown={startDrag}
		onpointermove={handleDragMove}
		onpointerup={stopDrag}
		onpointercancel={stopDrag}
		onkeydown={handleHeaderKeyDown}
	>
		<span class="tile-dot" data-module={meta?.module || 'code'}></span>
		<span class="tile-title text-xs">{meta?.label || 'Tile'}</span>
		
		<div class="tile-actions row ycenter">
			<!-- Focus button -->
			<button 
				class="tile-action-btn" 
				onclick={() => canvas.focusTile(canvas.focusedId === tile.id ? null : tile.id)}
				title={canvas.focusedId === tile.id ? "Exit Focus" : "Focus Tile"}
			>
				<img src="/iconset/expand.svg" alt="" class="icon-svg-xs" />
			</button>
			<!-- Close button -->
			<button 
				class="tile-action-btn" 
				onclick={() => canvas.removeTile(tile.id)}
				title="Close Tile"
			>
				<img src="/iconset/close.svg" alt="" class="icon-svg-xs" />
			</button>
		</div>
	</header>
	
	<div class="tile-body box overflow-hidden">
		{#if Body}
			<!-- Pass side prop for fileTree explorer component compatibility -->
			<Body side="left" />
		{:else}
			<div class="empty-state text-xs col3 pad16">Unknown Tile Kind: {tile.kind}</div>
		{/if}
	</div>
	
	<span
		class="tile-resize"
		role="slider"
		tabindex="0"
		aria-label="Resize {meta?.label || 'tile'}. Use arrow keys to resize, hold Shift for larger steps."
		aria-orientation="horizontal"
		aria-valuenow={tile.w}
		onpointerdown={startResize}
		onpointermove={handleResizeMove}
		onpointerup={stopResize}
		onpointercancel={stopResize}
		onkeydown={handleResizeKeyDown}
	></span>
</section>
