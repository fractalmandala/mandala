<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';
	import CanvasGridControls from './CanvasGridControls.svelte';
	import { canvasGrid, type CanvasGridPoint } from '../state/canvasGrid.svelte';
	import { newdesign } from '../state/newdesign.svelte';
	import { canvasPatternById } from '../data/canvasPatterns';

	interface Props {
		children: Snippet;
		onbackground?: () => void;
	}

	let { children, onbackground }: Props = $props();
	let viewport = $state<HTMLDivElement | null>(null);
	let activePointerId = $state<number | null>(null);
	let origin = $state({ x: 0, y: 0 });
	let spacePressed = $state(false);

	function pointFor(event: { clientX: number; clientY: number }): CanvasGridPoint | null {
		const rect = viewport?.getBoundingClientRect();
		if (!rect || event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return null;
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	export function clientToWorld(event: { clientX: number; clientY: number }): CanvasGridPoint | null {
		const point = pointFor(event);
		return point ? canvasGrid.toWorld(point) : null;
	}

	function beginPan(event: PointerEvent) {
		const canPan = event.button === 1 || (event.button === 0 && spacePressed);
		if (!canPan || activePointerId !== null) {
			if (event.button === 0) onbackground?.();
			return;
		}
		event.preventDefault();
		activePointerId = event.pointerId;
		origin = { x: event.clientX, y: event.clientY };
		canvasGrid.beginGesture();
		window.addEventListener('pointermove', pan, true);
		window.addEventListener('pointerup', finishPan, true);
		window.addEventListener('pointercancel', finishPan, true);
	}

	function pan(event: PointerEvent) {
		if (event.pointerId !== activePointerId) return;
		canvasGrid.panBy(event.clientX - origin.x, event.clientY - origin.y);
		origin = { x: event.clientX, y: event.clientY };
	}

	function finishPan(event: PointerEvent) {
		if (event.pointerId !== activePointerId) return;
		clearPanListeners();
		canvasGrid.endGesture();
	}

	function clearPanListeners() {
		window.removeEventListener('pointermove', pan, true);
		window.removeEventListener('pointerup', finishPan, true);
		window.removeEventListener('pointercancel', finishPan, true);
		activePointerId = null;
	}

	function zoom(event: WheelEvent) {
		if (!event.ctrlKey && !event.metaKey) return;
		const point = pointFor(event);
		if (!point) return;
		event.preventDefault();
		canvasGrid.zoomBy(event.deltaY < 0 ? 1.1 : 1 / 1.1, point);
	}

	function keyDown(event: KeyboardEvent) {
		if (event.code === 'Space' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) spacePressed = true;
	}

	function keyUp(event: KeyboardEvent) {
		if (event.code === 'Space') spacePressed = false;
	}

	function center(): CanvasGridPoint {
		const rect = viewport?.getBoundingClientRect();
		return { x: (rect?.width ?? 0) / 2, y: (rect?.height ?? 0) / 2 };
	}

	let activePattern = $derived(canvasPatternById(newdesign.canvasPatternId));

	let viewportStyle = $derived.by(() => {
		if (!activePattern) {
			return `background-position: ${canvasGrid.x}px ${canvasGrid.y}px; background-size: ${24 * canvasGrid.zoom}px ${24 * canvasGrid.zoom}px;`;
		}
		return `background-color: ${activePattern.backgroundColor}; background-image: none;`;
	});

	// Pattern artwork (gradients + masks) lives on its own layer so masks never
	// fade the base color, and world units always paint above the backdrop.
	let patternLayerStyle = $derived.by(() => {
		if (!activePattern) return '';
		let css = '';
		if (activePattern.backgroundImage) css += `background-image: ${activePattern.backgroundImage};`;
		if (activePattern.backgroundSize) css += ` background-size: ${activePattern.backgroundSize};`;
		if (activePattern.backgroundPosition) css += ` background-position: ${activePattern.backgroundPosition};`;
		if (activePattern.maskImage) css += ` -webkit-mask-image: ${activePattern.maskImage}; mask-image: ${activePattern.maskImage};`;
		if (activePattern.maskComposite) css += ` -webkit-mask-composite: ${activePattern.maskComposite}; mask-composite: ${activePattern.maskComposite};`;
		return css;
	});

	onDestroy(clearPanListeners);
</script>

<svelte:window onkeydown={keyDown} onkeyup={keyUp} />

<div
	bind:this={viewport}
	class="newdesign-canvas-grid-viewport"
	class:panning={activePointerId !== null}
	style={viewportStyle}
	role="application"
	aria-label="Canvas. Hold Space or use the middle mouse button to pan. Use Command or Control and the mouse wheel to zoom."
	onpointerdown={beginPan}
	onwheel={zoom}
>
	{#if activePattern}
		<div class="newdesign-canvas-grid-pattern" style={patternLayerStyle}></div>
	{/if}
	<div class="newdesign-canvas-grid-world" style:transform={`translate(${canvasGrid.x}px, ${canvasGrid.y}px) scale(${canvasGrid.zoom})`}>
		{@render children()}
	</div>
	<CanvasGridControls {center} />
</div>
