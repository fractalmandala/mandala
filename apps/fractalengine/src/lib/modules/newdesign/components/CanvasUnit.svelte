<script lang="ts">
	import { onDestroy } from 'svelte';
	import { canvasGrid } from '../state/canvasGrid.svelte';
	import { newdesign, type NewDesignUnit } from '../state/newdesign.svelte';

	interface Props { unit: NewDesignUnit; selected: boolean; }
	let { unit, selected }: Props = $props();
	let activePointerId = $state<number | null>(null);
	let mode = $state<'drag' | 'resize' | 'rotate' | null>(null);
	let origin = $state({ pointerX: 0, pointerY: 0, x: 0, y: 0, w: 0, h: 0, rotation: 0, angle: 0 });
	let element = $state<HTMLDivElement | null>(null);

	function angleFor(event: PointerEvent): number {
		const viewport = element?.closest<HTMLElement>('.newdesign-canvas-grid-viewport')?.getBoundingClientRect();
		if (!viewport) return 0;
		const point = canvasGrid.toWorld({ x: event.clientX - viewport.left, y: event.clientY - viewport.top });
		return Math.atan2(point.y - (unit.y + unit.h / 2), point.x - (unit.x + unit.w / 2));
	}

	function start(event: PointerEvent, nextMode: 'drag' | 'resize' | 'rotate') {
		if (event.button !== 0 || activePointerId !== null) return;
		event.stopPropagation();
		newdesign.select(unit.id);
		newdesign.beginGesture();
		activePointerId = event.pointerId;
		mode = nextMode;
		origin = { pointerX: event.clientX, pointerY: event.clientY, x: unit.x, y: unit.y, w: unit.w, h: unit.h, rotation: unit.rotation, angle: angleFor(event) };
		window.addEventListener('pointermove', move, true);
		window.addEventListener('pointerup', finish, true);
		window.addEventListener('pointercancel', cancel, true);
	}

	function move(event: PointerEvent) {
		if (event.pointerId !== activePointerId || !mode) return;
		const dx = (event.clientX - origin.pointerX) / canvasGrid.zoom;
		const dy = (event.clientY - origin.pointerY) / canvasGrid.zoom;
		if (mode === 'drag') newdesign.update(unit.id, { x: origin.x + dx, y: origin.y + dy });
		else if (mode === 'resize') newdesign.update(unit.id, { w: Math.max(96, origin.w + dx), h: Math.max(64, origin.h + dy) });
		else {
			const degrees = origin.rotation + ((angleFor(event) - origin.angle) * 180) / Math.PI;
			newdesign.update(unit.id, { rotation: Math.round(event.shiftKey ? Math.round(degrees / 15) * 15 : degrees) });
		}
	}

	function clearListeners() {
		window.removeEventListener('pointermove', move, true);
		window.removeEventListener('pointerup', finish, true);
		window.removeEventListener('pointercancel', cancel, true);
		activePointerId = null;
		mode = null;
	}

	function finish(event: PointerEvent) {
		if (event.pointerId !== activePointerId) return;
		clearListeners();
		newdesign.endGesture();
	}

	function cancel(event: PointerEvent) {
		if (event.pointerId !== activePointerId) return;
		newdesign.update(unit.id, { x: origin.x, y: origin.y, w: origin.w, h: origin.h, rotation: origin.rotation });
		clearListeners();
		newdesign.endGesture();
	}

	onDestroy(clearListeners);
</script>

<div
	bind:this={element}
	class="newdesign-canvas-unit"
	class:selected
	style:left={`${unit.x}px`}
	style:top={`${unit.y}px`}
	style:width={`${unit.w}px`}
	style:height={`${unit.h}px`}
	style:transform={`rotate(${unit.rotation}deg)`}
	onpointerdown={(event) => start(event, 'drag')}
	role="group"
	aria-label="Interactive unit. Drag to move."
>
	<span class="text-item-lg">Interactive unit</span>
	<span class="text-item-sm muted">Drag to move · Shift rotates in 15° steps</span>
	{#if selected}
		<button type="button" class="newdesign-rotate-handle" onpointerdown={(event) => start(event, 'rotate')} aria-label="Rotate unit"></button>
		<button type="button" class="newdesign-resize-handle" onpointerdown={(event) => start(event, 'resize')} aria-label="Resize unit"></button>
	{/if}
</div>
