<script lang="ts">
	import { canvasGrid } from '../state/canvasGrid.svelte';

	interface Props {
	center: () => { x: number; y: number };
	}

	let { center }: Props = $props();

	function zoomIn() { canvasGrid.zoomBy(1.2, center()); }
	function zoomOut() { canvasGrid.zoomBy(1 / 1.2, center()); }
</script>

<div class="newdesign-canvas-controls" role="group" aria-label="Canvas zoom controls">
	<button type="button" class="btn-icon newdesign-canvas-control" aria-label="Zoom out" onclick={zoomOut}>−</button>
	<span class="text-meta newdesign-canvas-zoom">{Math.round(canvasGrid.zoom * 100)}%</span>
	<button type="button" class="btn-icon newdesign-canvas-control" aria-label="Zoom in" onclick={zoomIn}>+</button>
	<button type="button" class="btn-icon newdesign-canvas-control" aria-label="Reset canvas view" onclick={() => canvasGrid.reset()}>↺</button>
</div>
