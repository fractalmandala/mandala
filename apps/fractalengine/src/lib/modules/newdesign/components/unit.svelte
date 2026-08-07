<script lang="ts">
	import { onDestroy } from 'svelte';

	interface Props {
		ondrop: (point: { clientX: number; clientY: number }) => void;
	}

	let { ondrop }: Props = $props();
	let activePointerId = $state<number | null>(null);
	let dragging = $state(false);

	function beginDrag(event: PointerEvent) {
		if (event.button !== 0 || activePointerId !== null) return;
		activePointerId = event.pointerId;
		dragging = true;
		window.addEventListener('pointerup', finishDrag, true);
		window.addEventListener('pointercancel', cancelDrag, true);
		event.preventDefault();
	}

	function finishDrag(event: PointerEvent) {
		if (event.pointerId !== activePointerId) return;
		activePointerId = null;
		dragging = false;
		window.removeEventListener('pointerup', finishDrag, true);
		window.removeEventListener('pointercancel', cancelDrag, true);
		ondrop({ clientX: event.clientX, clientY: event.clientY });
	}

	function cancelDrag(event: PointerEvent) {
		if (event.pointerId !== activePointerId) return;
		activePointerId = null;
		dragging = false;
		window.removeEventListener('pointerup', finishDrag, true);
		window.removeEventListener('pointercancel', cancelDrag, true);
	}

	onDestroy(() => {
		window.removeEventListener('pointerup', finishDrag, true);
		window.removeEventListener('pointercancel', cancelDrag, true);
	});
</script>

<button
	type="button"
	class="newdesign-library-unit"
	class:dragging
	onpointerdown={beginDrag}
	aria-label="Drag interactive unit onto the canvas"
>
	<img src="/iconset/component.svg" alt="" class="icon-svg-sm" />
	<span class="text-item">Interactive unit</span>
	<span class="text-item-sm muted">Drag to canvas</span>
</button>
