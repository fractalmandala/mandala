---
title: ComponentRegistry Component
description: A Svelte 5 component displaying a catalog of reusable components inside the side panels which can be clicked or dragged directly onto the active workspace.
---

# ComponentRegistry Component

* **File Location**: `src/lib/components/ComponentRegistry.svelte`
* **Purpose**: Provides a tab/grid index of spawnable workspace components. Dragging any card starts a drag action that feeds component metadata into the canvas drag-and-drop drop handler.

---

## Implementation

```svelte
<script lang="ts">
	interface RegistryComponent {
		type: string;
		label: string;
		description: string;
		icon: string;
	}

	const componentList: RegistryComponent[] = [
		{ type: "button", label: "Button", description: "Interactive click target", icon: "🔳" },
		{ type: "badge", label: "Badge", description: "Pill indicator labels", icon: "🏷️" },
		{ type: "avatar", label: "Avatar", description: "User profile thumbnail", icon: "👤" },
		{ type: "separator", label: "Separator", description: "Thin divider line", icon: "➖" },
		{ type: "input", label: "Input", description: "Text input fields", icon: "✏️" },
		{ type: "textarea", label: "Textarea", description: "Multi-line text edits", icon: "📝" },
		{ type: "checkbox", label: "Checkbox", description: "Binary choice switch", icon: "☑️" },
		{ type: "switch", label: "Switch", description: "Toggle state controller", icon: "🔛" },
		{ type: "tabs", label: "Tabs", description: "Tab container switcher", icon: "🗂️" },
		{ type: "card", label: "Card", description: "Content panel card box", icon: "🗂️" }
	];

	function handleDragStart(e: DragEvent, type: string) {
		if (e.dataTransfer) {
			e.dataTransfer.setData("application/fractal-component", type);
			e.dataTransfer.effectAllowed = "copy";
		}
	}
</script>

<div class="component-registry">
	<div class="search-box">
		<input type="text" placeholder="Search components..." class="search-input" aria-label="Search components" />
	</div>

	<div class="components-grid">
		{#each componentList as component}
			<button 
				class="component-card"
				draggable="true"
				ondragstart={(e) => handleDragStart(e, component.type)}
			>
				<span class="card-icon" aria-hidden="true">{component.icon}</span>
				<div class="card-meta">
					<span class="card-label">{component.label}</span>
					<span class="card-desc">{component.description}</span>
				</div>
			</button>
		{/each}
	</div>
</div>
```
