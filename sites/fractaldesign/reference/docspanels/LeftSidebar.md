---
title: LeftSidebar Component
description: A Svelte 5 component managing a vertically stacked sidebar (Layers/Components + AI chat panel) separated by a draggable resize handler, including collapsible sidebar logic.
---

# LeftSidebar Component

* **File Location**: `src/lib/components/LeftSidebar.svelte`
* **Purpose**: Vertically stacks the Navigation/Component tree and the AI Assistant chat. Allows dragging the horizontal resizer between them to adjust their relative height, and supports collapsing the entire sidebar to the corner.

---

## Implementation

```svelte
<script lang="ts">
	import { getContext } from "svelte";
	import { canvasState } from "../stores/canvas.svelte.js";

	// Props
	interface Props {
		onToggleCollapse?: () => void;
		components?: import("svelte").Snippet;
	}
	let { onToggleCollapse, components }: Props = $props();

	// Reactive heights and resize states
	let sidebarElement = $state<HTMLElement | null>(null);
	let topHeight = $state(450); // initial top panel height
	let isResizing = $state(false);
	let sidebarHeight = $state(800);

	const minHeight = 150; // min height for top or bottom pane

	// Update container height dynamically
	$effect(() => {
		if (sidebarElement) {
			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					sidebarHeight = entry.contentRect.height;
				}
			});
			resizeObserver.observe(sidebarElement);
			return () => resizeObserver.disconnect();
		}
	});

	function handlePointerDown(e: PointerEvent) {
		isResizing = true;
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isResizing || !sidebarElement) return;
		const sidebarRect = sidebarElement.getBoundingClientRect();
		const newHeight = e.clientY - sidebarRect.top;

		if (newHeight >= minHeight && newHeight <= sidebarHeight - minHeight) {
			topHeight = newHeight;
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (isResizing) {
			isResizing = false;
			const target = e.currentTarget as HTMLElement;
			target.releasePointerCapture(e.pointerId);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === "ArrowUp") {
			e.preventDefault();
			topHeight = Math.max(minHeight, topHeight - 10);
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			topHeight = Math.min(sidebarHeight - minHeight, topHeight + 10);
		}
	}
</script>

<aside 
	bind:this={sidebarElement}
	class="left-sidebar"
	class:collapsed={canvasState.isLeftSidebarCollapsed}
>
	<!-- Top Pane: Layers & Components Tabs -->
	<div class="sidebar-pane" style="height: {topHeight}px">
		<div class="pane-tabs-header" role="tablist" aria-label="Sidebar panels">
			<button 
				id="tab-layers"
				class="tab-trigger" 
				class:active={canvasState.activeLeftTab === 'layers'} 
				role="tab"
				aria-selected={canvasState.activeLeftTab === 'layers'}
				aria-controls="panel-layers"
				onclick={() => canvasState.activeLeftTab = 'layers'}
			>
				Layers
			</button>
			<button 
				id="tab-components"
				class="tab-trigger" 
				class:active={canvasState.activeLeftTab === 'components'} 
				role="tab"
				aria-selected={canvasState.activeLeftTab === 'components'}
				aria-controls="panel-components"
				onclick={() => canvasState.activeLeftTab = 'components'}
			>
				Components
			</button>
		</div>

		<div class="pane-content">
			{#if canvasState.activeLeftTab === 'layers'}
				<div 
					id="panel-layers"
					role="tabpanel"
					aria-labelledby="tab-layers"
					class="layers-tree-placeholder"
				>
					<span class="muted-text">No layers selected</span>
				</div>
			{:else}
				<div 
					id="panel-components"
					role="tabpanel"
					aria-labelledby="tab-components"
					class="panel-components-content"
				>
					{@render components?.()}
				</div>
			{/if}
		</div>
	</div>

	<!-- Draggable Resizer Bar -->
	<div 
		class="sidebar-resizer"
		class:active={isResizing}
		role="separator"
		aria-orientation="horizontal"
		tabindex="0"
		aria-valuenow={topHeight}
		aria-valuemin={minHeight}
		aria-valuemax={sidebarHeight - minHeight}
		aria-label="Sidebar Resizer"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onkeydown={handleKeyDown}
	>
		<div class="resizer-knob"></div>
	</div>

	<!-- Bottom Pane: AI Chat ("Jules") -->
	<div class="sidebar-pane chat-pane" style="height: {sidebarHeight - topHeight - 8}px">
		<div class="pane-header">
			<span class="header-title">AI assistant</span>
		</div>
		<div class="chat-viewport">
			<!-- Render AI chat window messages -->
			<div class="chat-placeholder">
				<span class="assistant-avatar" aria-hidden="true">🤖</span>
				<p class="muted-text">Ask anything to generate, edit, or style elements...</p>
			</div>
		</div>
		<div class="chat-input-bar">
			<input type="text" placeholder="Ask AI..." class="chat-input" aria-label="Ask AI assistant" />
		</div>
	</div>
</aside>
```
```
