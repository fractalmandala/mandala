# OverflowActions Layout Capture

**Source component:** `overflow-actions.svelte`  
**Sibling styles:** `overflow-actions.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	OA_ROOT["`**overflow actions anchor**<br/>*(relative inline-flex positioning context)*`"]
	OA_TRIGGER["`**menu trigger**<br/>*(inline-flex centered; min-width and height 2.5rem; children snippet or fallback dots)*`"]
	OA_MENU["`**menu**<br/>*(conditional when open; absolute grid; z-index 60; min-width 11rem; space-1 padding)*`"]
	OA_PLACEMENT["`**placement offsets**<br/>*(top or bottom by 100% plus space-1; start or end edge alignment)*`"]
	OA_ITEM["`**menu items**<br/>*({#each} keyed items; 100% flex rows; space-2 gap; token padding)*`"]
	OA_ICON["`**item icon**<br/>*(optional snippet; inline-flex)*`"]
	OA_LABEL["`**item label**<br/>*(row text)*`"]
	OA_ROOT --> OA_TRIGGER
	OA_ROOT --> OA_MENU
	OA_MENU -. positioned by .-> OA_PLACEMENT
	OA_MENU --> OA_ITEM
	OA_ITEM --> OA_ICON
	OA_ITEM --> OA_LABEL
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph OA_ROOT_BOX["div[data-slot=overflow-actions] — relative inline-flex"]
		direction TB
		subgraph OA_TRIGGER_BOX["button[data-slot=overflow-actions-trigger]"]
			direction LR
			OA_TRIGGER_CONTENT["children() snippet or fallback dots"]
		end
		subgraph OA_MENU_BOX["div[data-slot=overflow-actions-menu] — open-only absolute grid"]
			direction TB
			subgraph OA_ITEM_BOX["button[data-slot=overflow-actions-item] — repeated flex row"]
				direction LR
				OA_ITEM_ICON["optional item.icon() snippet"]
				OA_ITEM_TEXT["item label"]
			end
		end
	end
```

## Layout breakdown

- `OA_ROOT` / `OA_ROOT_BOX` creates the positioning context and contains the persistent trigger plus the conditional menu.
- `OA_TRIGGER` centers either the caller's `children()` snippet or the fallback dots within a minimum `2.5rem` control.
- `OA_MENU` is an absolutely positioned vertical grid. The placement prop selects top/bottom offset and start/end physical edge anchoring relative to the root.
- `OA_ITEM` repeats as a full-width flex row with an optional icon and label. No breakpoint, sticky/fixed region, or declared scrolling boundary is present.
