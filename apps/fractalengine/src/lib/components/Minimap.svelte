<script lang="ts">
	import { onMount } from 'svelte';
	import { canvas } from '../state/canvas.svelte';
	import { TILE_KINDS } from '../data/tileKinds';

	let minimapEl = $state<HTMLElement | null>(null);
	let isDragging = $state(false);

	let winW = $state(1024);
	let winH = $state(768);

	onMount(() => {
		if (typeof window !== 'undefined') {
			winW = window.innerWidth;
			winH = window.innerHeight;
			const handleResize = () => {
				winW = window.innerWidth;
				winH = window.innerHeight;
			};
			window.addEventListener('resize', handleResize);
			return () => window.removeEventListener('resize', handleResize);
		}
	});

	// Minimap container size constants
	const MAP_WIDTH = 160;
	const MAP_HEIGHT = 100;

	// Compute dimensions dynamically
	const mapData = $derived.by(() => {
		const vLeft = -canvas.viewport.x / canvas.viewport.zoom;
		const vTop = -canvas.viewport.y / canvas.viewport.zoom;
		const vRight = (winW - canvas.viewport.x) / canvas.viewport.zoom;
		const vBottom = (winH - canvas.viewport.y) / canvas.viewport.zoom;

		let mapMinX = vLeft;
		let mapMinY = vTop;
		let mapMaxX = vRight;
		let mapMaxY = vBottom;

		for (const t of canvas.tiles) {
			mapMinX = Math.min(mapMinX, t.x);
			mapMinY = Math.min(mapMinY, t.y);
			mapMaxX = Math.max(mapMaxX, t.x + t.w);
			mapMaxY = Math.max(mapMaxY, t.y + t.h);
		}

		const mapW = mapMaxX - mapMinX;
		const mapH = mapMaxY - mapMinY;

		const scaleX = MAP_WIDTH / mapW;
		const scaleY = MAP_HEIGHT / mapH;
		const scale = Math.min(scaleX, scaleY);

		const offsetX = (MAP_WIDTH - mapW * scale) / 2;
		const offsetY = (MAP_HEIGHT - mapH * scale) / 2;

		const toMapCoords = (bx: number, by: number) => {
			return {
				x: (bx - mapMinX) * scale + offsetX,
				y: (by - mapMinY) * scale + offsetY
			};
		};

		const viewportBox = {
			x: (vLeft - mapMinX) * scale + offsetX,
			y: (vTop - mapMinY) * scale + offsetY,
			w: (vRight - vLeft) * scale,
			h: (vBottom - vTop) * scale
		};

		const tileBoxes = canvas.tiles.map(t => {
			const coords = toMapCoords(t.x, t.y);
			return {
				id: t.id,
				x: coords.x,
				y: coords.y,
				w: t.w * scale,
				h: t.h * scale,
				kind: t.kind,
				module: TILE_KINDS[t.kind]?.module || 'code'
			};
		});

		return {
			viewportBox,
			tileBoxes,
			mapMinX,
			mapMinY,
			scale,
			offsetX,
			offsetY
		};
	});

	function panToMinimapCoords(clientX: number, clientY: number) {
		if (!minimapEl) return;
		const rect = minimapEl.getBoundingClientRect();
		const clickX = clientX - rect.left;
		const clickY = clientY - rect.top;

		const { mapMinX, mapMinY, scale, offsetX, offsetY } = mapData;

		// Map back to board coordinates
		const targetBX = (clickX - offsetX) / scale + mapMinX;
		const targetBY = (clickY - offsetY) / scale + mapMinY;

		canvas.viewport.x = winW / 2 - targetBX * canvas.viewport.zoom;
		canvas.viewport.y = winH / 2 - targetBY * canvas.viewport.zoom;
		canvas.saveLayout();
	}

	function handlePointerDown(e: PointerEvent) {
		isDragging = true;
		canvas.beginGesture();
		minimapEl?.setPointerCapture(e.pointerId);
		panToMinimapCoords(e.clientX, e.clientY);
		e.preventDefault();
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		panToMinimapCoords(e.clientX, e.clientY);
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		if (minimapEl?.hasPointerCapture(e.pointerId)) minimapEl.releasePointerCapture(e.pointerId);
		canvas.endGesture();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
	bind:this={minimapEl}
	class="minimap box shadow-lg"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
>
	<!-- Scaled Tiles -->
	{#each mapData.tileBoxes as tb (tb.id)}
		<div 
			class="minimap-tile"
			class:active={canvas.activeId === tb.id}
			style="left: {tb.x}px; top: {tb.y}px; width: {tb.w}px; height: {tb.h}px;"
			data-module={tb.module}
		></div>
	{/each}

	<!-- Viewport outline -->
	<div 
		class="minimap-viewport"
		style="left: {mapData.viewportBox.x}px; top: {mapData.viewportBox.y}px; width: {mapData.viewportBox.w}px; height: {mapData.viewportBox.h}px;"
	></div>
</div>
