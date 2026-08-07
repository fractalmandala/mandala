---
title: TagSelector Component
description: A Svelte 5 component inside the right property sheet panel that overrides element node wrappers with semantic HTML tags (e.g. div, section, header, nav) using a custom styled select picker.
---

# TagSelector Component

* **File Location**: `src/lib/components/TagSelector.svelte`
* **Purpose**: Displays inside the element property sheet on the right panel. Interacts with the canvas state and overrides the HTML layout tag wrapper for the selected block. Avoids native select pickers in favor of a custom popover spectrum selector.

---

## Implementation

```svelte
<script lang="ts">
	import { canvasState } from "../stores/canvas.svelte.js";

	// List of supported semantic wrapper tags
	const tags = [
		"div",
		"section",
		"article",
		"header",
		"nav",
		"main",
		"footer",
		"aside",
		"ul",
		"ol",
		"li",
		"figure",
		"figcaption"
	];

	let showDropdown = $state(false);

	// Get active node tag or fallback
	let selectedTag = $derived(
		canvasState.selectedNodeId 
			? canvasState.nodes[canvasState.selectedNodeId]?.tag ?? "div" 
			: "div"
	);

	function changeTag(tag: string) {
		if (canvasState.selectedNodeId) {
			canvasState.updateNodeTag(canvasState.selectedNodeId, tag);
		}
		showDropdown = false;
	}
</script>

<div class="tag-selector-field">
	<label for="tag-trigger-select" class="tag-label">Semantic Element Wrapper</label>
	
	<!-- Dropdown Trigger -->
	<button 
		id="tag-trigger-select"
		class="tag-trigger" 
		class:active={showDropdown}
		disabled={!canvasState.selectedNodeId}
		aria-haspopup="listbox"
		aria-expanded={showDropdown}
		aria-controls="tag-listbox"
		onclick={() => showDropdown = !showDropdown}
	>
		<code class="tag-code">&lt;{selectedTag}&gt;</code>
		<span class="chevron-arrow" aria-hidden="true">▼</span>
	</button>

	<!-- Custom Dropdown Selector -->
	{#if showDropdown && canvasState.selectedNodeId}
		<div class="tag-dropdown">
			<div class="dropdown-header">Change wrapper tag</div>
			<div 
				id="tag-listbox" 
				class="options-list" 
				role="listbox" 
				aria-label="HTML semantic tags"
			>
				{#each tags as tag}
					<button 
						class="option-item" 
						class:selected={selectedTag === tag}
						role="option"
						aria-selected={selectedTag === tag}
						onclick={() => changeTag(tag)}
					>
						<code class="option-code">&lt;{tag}&gt;</code>
						{#if selectedTag === tag}
							<span class="check-mark" aria-hidden="true">✓</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
```
