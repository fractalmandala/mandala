# ExpandableActionBar Layout Capture

**Source component:** `expandable-action-bar.svelte`  
**Sibling styles:** `expandable-action-bar.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	EA_ROOT["`**expandable action bar**<br/>*(inline-flex toolbar row; centered; space-1 gap and padding; pill boundary)*`"]
	EA_LOOP["`**action buttons**<br/>*({#each} keyed items; relative inline-flex; 2rem or 1.75rem tall)*`"]
	EA_ICON["`**icon**<br/>*(required snippet; inline-flex)*`"]
	EA_LABEL["`**label**<br/>*(collapsed max-width 0; expanded up to 8rem; no wrap)*`"]
	EA_SHORTCUT["`**shortcut**<br/>*(optional; shares collapsed/expanded width behavior)*`"]
	EA_BADGE["`**badge**<br/>*(optional; inline-flex pill; min-width and height 1rem)*`"]
	EA_ROOT --> EA_LOOP
	EA_LOOP --> EA_ICON
	EA_LOOP --> EA_LABEL
	EA_LOOP --> EA_SHORTCUT
	EA_LOOP --> EA_BADGE
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph EA_TOOLBAR_BOX["div[data-slot=expandable-action-bar] — role toolbar, inline-flex row"]
		direction LR
		subgraph EA_ITEM_BOX["button[data-slot=expandable-action-bar-item] — repeated relative inline-flex"]
			direction LR
			EA_ICON_RENDER["item.icon() snippet"]
			EA_LABEL_TEXT["label span — width animates with expanded state"]
			EA_SHORTCUT_TEXT["optional kbd — width animates with expanded state"]
			EA_BADGE_TEXT["optional badge span — compact pill"]
		end
	end
```

## Layout breakdown

- `EA_ROOT` / `EA_TOOLBAR_BOX` is one non-wrapping inline flex toolbar; expansion changes descendant gaps but does not create another row.
- `EA_LOOP` / `EA_ITEM_BOX` repeats one button per item and contains all item-level regions horizontally.
- `EA_LABEL` and `EA_SHORTCUT` stay in the DOM while collapsed, using zero maximum width, hidden overflow, and zero opacity; expanded state allows up to `8rem` each.
- `EA_BADGE` remains visible independently of expansion. The small size variant reduces button dimensions; no viewport breakpoint, sidebar, fixed/sticky, or scroll region exists.
