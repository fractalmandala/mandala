---
title: AnnotationList Component
description: A Svelte 5 panel component showing a lists of active UI annotations mapped across elements. Clicking items highlights targeted nodes, and a trigger button starts the AI compilation loop.
---

# AnnotationList Component

* **File Location**: `src/lib/components/AnnotationList.svelte`
* **Purpose**: Mounts inside the sidebar or chat viewport. Summarizes all annotation notes written on the canvas. Provides shortcuts to focus node outlines and trigger Jules AI to compile and solve the selected design changes.

---

## Implementation

```svelte
<script lang="ts">
	import { canvasState } from "../stores/canvas.svelte.js";

	// Select and center target node on canvas
	function focusNode(nodeId: string) {
		canvasState.selectedNodeId = nodeId;
		const element = document.querySelector(`[data-node-id="${nodeId}"]`);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
			
			// Trigger temporary flash ring
			element.classList.add("flash-highlight");
			setTimeout(() => element.classList.remove("flash-highlight"), 1500);
		}
	}

	function removeAnnotation(nodeId: string, annotationId: string) {
		canvasState.removeNodeAnnotation(nodeId, annotationId);
	}

	// Trigger AI compilation run
	let isCompiling = $state(false);
	function handleCompileAll() {
		isCompiling = true;
		// Mock compiling delay
		setTimeout(() => {
			canvasState.solveAllAnnotations();
			isCompiling = false;
		}, 2000);
	}
</script>

<div class="annotation-panel">
	<header class="panel-header">
		<span class="title">Active Annotations ({canvasState.totalAnnotations})</span>
	</header>

	<div class="annotations-list">
		{#if canvasState.totalAnnotations === 0}
			<div class="empty-state">
				<span class="icon" aria-hidden="true">💡</span>
				<p class="muted-text">Press the Inspector button and click elements to drop AI notes.</p>
			</div>
		{:else}
			{#each Object.values(canvasState.nodes) as node}
				{#if node.annotations && node.annotations.length > 0}
					{#each node.annotations as note}
						<div class="annotation-item-card" class:solved={note.status === 'resolved'}>
							<div class="card-header">
								<span class="tag-badge"><code>&lt;{node.tag}&gt;</code></span>
								<span class="status-tag" class:resolved={note.status === 'resolved'}>
									{note.status}
								</span>
							</div>

							<p class="card-prompt">{note.prompt}</p>

							<div class="card-footer">
								<button 
									class="footer-btn focus-btn" 
									onclick={() => focusNode(node.id)}
									aria-label="Focus element on canvas"
								>
									Focus Element
								</button>
								<button 
									class="footer-btn delete-btn" 
									onclick={() => removeAnnotation(node.id, note.id)}
									aria-label="Delete annotation"
								>
									Delete
								</button>
							</div>
						</div>
					{/each}
				{/if}
			{/each}
		{/if}
	</div>

	<!-- AI compilation trigger button -->
	{#if canvasState.totalAnnotations > 0}
		<div class="panel-actions">
			<button 
				class="compile-btn" 
				disabled={isCompiling}
				onclick={handleCompileAll}
			>
				{#if isCompiling}
					<span>Solving layout...</span>
				{:else}
					<span>Solve Layout with AI</span>
				{/if}
			</button>
		</div>
	{/if}
</div>
```
