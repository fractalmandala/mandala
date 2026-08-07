---
title: CanvasInspector Component
description: A Svelte 5 canvas overlay component that highlights design nodes, captures mouse clicks to open comment inputs, and renders pin badges for active AI annotations.
---

# CanvasInspector Component

* **File Location**: `src/lib/components/CanvasInspector.svelte`
* **Purpose**: Provides the visual canvas editing annotations overlay. When active, it tracks mouse pointer events over elements with `data-node-id`, overlays a highlight rectangle, presents a visual comment popover tooltip, and adds annotations to the canvas state.

---

## Implementation

```svelte
<script lang="ts">
	import { canvasState } from "../stores/canvas.svelte.js";

	// Props
	interface Props {
		active?: boolean;
	}
	let { active = false }: Props = $props();

	// Component states
	let hoveredNodeId = $state<string | null>(null);
	let selectedNodeId = $state<string | null>(null);
	let noteText = $state("");
	let showPopover = $state(false);
	
	// Tooltip coordinate placement
	let popoverCoords = $state({ top: 0, left: 0 });
	let highlightRect = $state({ top: 0, left: 0, width: 0, height: 0 });

	// Track pointer move and calculate bounding boxes
	function handlePointerMove(e: PointerEvent) {
		if (!active || showPopover) return;

		const target = e.target as HTMLElement;
		const nodeElement = target.closest("[data-node-id]") as HTMLElement | null;

		if (nodeElement) {
			const id = nodeElement.getAttribute("data-node-id");
			if (id) {
				hoveredNodeId = id;
				const rect = nodeElement.getBoundingClientRect();
				const parentRect = nodeElement.offsetParent?.getBoundingClientRect();

				if (parentRect) {
					highlightRect = {
						top: rect.top - parentRect.top,
						left: rect.left - parentRect.left,
						width: rect.width,
						height: rect.height
					};
				} else {
					highlightRect = {
						top: rect.top + window.scrollY,
						left: rect.left + window.scrollX,
						width: rect.width,
						height: rect.height
					};
				}
				return;
			}
		}
		hoveredNodeId = null;
	}

	function handlePointerDown(e: PointerEvent) {
		if (!active || !hoveredNodeId) return;
		e.preventDefault();
		e.stopPropagation();

		selectedNodeId = hoveredNodeId;
		
		// Align popover near pointer coords
		popoverCoords = {
			top: e.clientY + window.scrollY + 10,
			left: e.clientX + window.scrollX
		};
		showPopover = true;
	}

	function saveNote() {
		if (selectedNodeId && noteText.trim()) {
			canvasState.addNodeAnnotation(selectedNodeId, noteText.trim());
			cancelEdit();
		}
	}

	function cancelEdit() {
		noteText = "";
		selectedNodeId = null;
		showPopover = false;
	}
</script>

<!-- Listen to pointer movements on workspace -->
<div 
	class="inspector-stage-listener"
	class:inspecting={active}
	onpointermove={handlePointerMove}
	onpointerdown={handlePointerDown}
>
	<!-- Bounding Highlighter Outline Box -->
	{#if active && hoveredNodeId && !showPopover}
		<div 
			class="node-highlighter-ring"
			style="top: {highlightRect.top}px; left: {highlightRect.left}px; width: {highlightRect.width}px; height: {highlightRect.height}px"
		>
			<span class="node-tag-badge">{canvasState.nodes[hoveredNodeId]?.tag || "div"}</span>
		</div>
	{/if}

	<!-- Comment Input Popover Tooltip -->
	{#if showPopover && selectedNodeId}
		<div 
			class="annotation-popover"
			style="top: {popoverCoords.top}px; left: {popoverCoords.left}px"
			role="dialog"
			aria-label="Add UI annotation"
		>
			<div class="popover-meta">
				<code>&lt;{canvasState.nodes[selectedNodeId]?.tag || "div"}&gt;</code> node annotation
			</div>
			
			<textarea 
				bind:value={noteText}
				placeholder="What should Jules do to this element? (e.g. make text bolder)"
				class="popover-textarea"
				aria-label="Annotation note"
				rows="3"
			></textarea>
			
			<div class="popover-actions">
				<button class="action-btn cancel" onclick={cancelEdit}>Cancel</button>
				<button class="action-btn save" onclick={saveNote} disabled={!noteText.trim()}>Save</button>
			</div>
		</div>
	{/if}
</div>
```
