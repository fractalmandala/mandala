---
title: TemplateDock Component
description: A Svelte 5 component situated in the central bottom dock. Clicking the launcher opens a catalog of structural layout templates (pricing, features, hero sections) which can be inserted into the active canvas.
---

# TemplateDock Component

* **File Location**: `src/lib/components/TemplateDock.svelte`
* **Purpose**: Mounts in the bottom menu bar dock. Allows the user to select predefined layout block templates and inject them into their document tree. Automatically records an undo snapshot (Rule 8 compliance) prior to loading the layout elements.

---

## Implementation

```svelte
<script lang="ts">
	import { canvasState } from "../stores/canvas.svelte.js";

	let showTemplates = $state(false);

	// Predefined templates structure
	const templatesList = [
		{
			id: "hero_headline",
			name: "Hero Section",
			description: "Minimalist centering layout for title cards",
			icon: "📢",
			nodes: [
				{ id: "h1", tag: "header", class: "hero-layout", children: ["h2", "h3"] },
				{ id: "h2", tag: "h1", content: "Create websites with AI agency blocks" },
				{ id: "h3", tag: "p", content: "Decompile designs, edit properties, compile to native code." }
			]
		},
		{
			id: "pricing_grids",
			name: "3-Column Pricing",
			description: "Stacked features table list with cards",
			icon: "💳",
			nodes: [
				{ id: "p1", tag: "section", class: "pricing-section", children: ["pc1", "pc2"] },
				{ id: "pc1", tag: "div", class: "price-card", children: ["ph1", "ph2"] },
				{ id: "ph1", tag: "h3", content: "Starter Pack ($9)" },
				{ id: "ph2", tag: "p", content: "Perfect for side projects" },
				{ id: "pc2", tag: "div", class: "price-card basic-highlight", children: ["ph3", "ph4"] },
				{ id: "ph3", tag: "h3", content: "Pro Pack ($29)" },
				{ id: "ph4", tag: "p", content: "For growing teams" }
			]
		}
	];

	function loadLayout(templateNodes: any[]) {
		canvasState.insertLayoutTemplate(templateNodes);
		showTemplates = false;
	}
</script>

<div class="template-dock-container">
	<!-- Launch Trigger Button -->
	<button 
		class="dock-launcher" 
		class:active={showTemplates}
		aria-haspopup="dialog"
		aria-expanded={showTemplates}
		aria-controls="templates-dialog"
		onclick={() => showTemplates = !showTemplates}
	>
		<span class="launcher-icon" aria-hidden="true">🧱</span>
		<span class="launcher-label">Layout Templates</span>
	</button>

	<!-- Layout Selector Popover Overlay -->
	{#if showTemplates}
		<div 
			id="templates-dialog" 
			class="templates-overlay" 
			role="dialog" 
			aria-modal="false"
			aria-label="Section Layout Templates"
		>
			<div class="overlay-header">
				<span class="title">Section Layouts</span>
				<button 
					class="close-btn" 
					aria-label="Close templates panel"
					onclick={() => showTemplates = false}
				>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			
			<div class="templates-grid">
				{#each templatesList as template}
					<button 
						class="template-item-card" 
						onclick={() => loadLayout(template.nodes)}
					>
						<span class="template-icon" aria-hidden="true">{template.icon}</span>
						<div class="template-meta">
							<span class="template-name">{template.name}</span>
							<span class="template-desc">{template.description}</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
```
