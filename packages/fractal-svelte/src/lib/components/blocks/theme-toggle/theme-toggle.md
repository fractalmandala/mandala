# ThemeToggle Layout Capture

**Source component:** `theme-toggle.svelte`  
**Sibling styles:** `theme-toggle.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	TT_ROOT["`**theme toggle button**<br/>*(inline-flex; centered; fixed 2.5rem square; no padding)*`"]
	TT_ICON["`**icon wrapper**<br/>*(inline-flex; 1.125rem icon child)*`"]
	TT_DARK["`**sun SVG**<br/>*(conditional when current theme is dark)*`"]
	TT_LIGHT["`**moon SVG**<br/>*(conditional when current theme is light)*`"]
	TT_VIEW["`**document view-transition layer**<br/>*(rectangle, circle, circle-blur, or blinds; viewport-level effect, not button layout)*`"]
	TT_ROOT --> TT_ICON
	TT_ICON --> TT_DARK
	TT_ICON --> TT_LIGHT
	TT_ROOT -. toggle initiates .-> TT_VIEW
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph TT_BUTTON_BOX["button[data-slot=theme-toggle] — fixed square inline-flex"]
		direction TB
		subgraph TT_ICON_BOX["span[data-slot=theme-toggle-icon] — centered inline-flex"]
			direction TB
			TT_THEME_BRANCH["sun SVG or moon SVG according to theme"]
		end
	end
	subgraph TT_DOCUMENT_BOX["html view-transition pseudo-elements — outside component DOM"]
		direction TB
		TT_OLD_ROOT["old(root) layer"]
		TT_NEW_ROOT["new(root) layer with selected clip-path animation"]
	end
```

## Layout breakdown

- `TT_ROOT` / `TT_BUTTON_BOX` is a fixed `2.5rem × 2.5rem` centered control with no internal spacing beyond the icon's own dimensions.
- `TT_ICON` contains exactly one conditional SVG: sun for dark theme or moon for light theme.
- `TT_VIEW` / `TT_DOCUMENT_BOX` distinguishes the document-level view-transition pseudo-elements from the button DOM; they animate the viewport but do not add component layout regions.
- Reduced-motion disables icon animation and the script skips view transitions. There are no responsive breakpoints, slots/snippets, loops, sidebars, sticky/fixed elements, or scroll regions.
