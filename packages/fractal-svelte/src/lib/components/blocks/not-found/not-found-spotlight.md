# NotFoundSpotlight Layout Capture

**Source component:** `not-found-spotlight.svelte`  
**Delegated layout and styles:** `not-found.svelte`, `not-found.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	NFS_WRAP["`**NotFoundSpotlight wrapper**<br/>*(forwards all props; fixes variant to spotlight; adds no DOM box)*`"]
	NFS_MAIN["`**NotFound main**<br/>*(centered vertical flex; min-height 26rem; space-5 gap; space-4 padding)*`"]
	NFS_PANEL["`**spotlight panel**<br/>*(single-cell grid; width min 36rem / 100%; 16:9; overflow hidden)*`"]
	NFS_BASE["`**base code layer**<br/>*(grid overlap; low-opacity code span)*`"]
	NFS_MASK["`**spotlit code layer**<br/>*(same grid area; radial mask follows pointer)*`"]
	NFS_COPY["`**copy section**<br/>*(title plus description capped at 26rem)*`"]
	NFS_ACTIONS["`**recovery links**<br/>*(centered wrapping flex; space-3 gap)*`"]
	NFS_WRAP --> NFS_MAIN
	NFS_MAIN --> NFS_PANEL
	NFS_PANEL --> NFS_BASE
	NFS_PANEL --> NFS_MASK
	NFS_MAIN --> NFS_COPY
	NFS_MAIN --> NFS_ACTIONS
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph NFS_DELEGATE["NotFound component instance — variant=spotlight"]
		direction TB
		subgraph NFS_MAIN_BOX["main[data-slot=not-found] — vertical flex"]
			direction TB
			subgraph NFS_PANEL_BOX["div[data-slot=not-found-spotlight] — centered grid"]
				direction TB
				NFS_BASE_CODE["span — background code layer at grid-area 1/1"]
				NFS_MASK_CODE["h1 — masked code layer at grid-area 1/1"]
			end
			subgraph NFS_COPY_BOX["section[data-slot=not-found-copy]"]
				direction TB
				NFS_TITLE["h2 title"]
				NFS_DESCRIPTION["p description"]
			end
			subgraph NFS_ACTION_BOX["nav[data-slot=not-found-actions] — wrapping flex"]
				direction LR
				NFS_HOME["home link"]
				NFS_BROWSE["browse link"]
			end
		end
	end
```

## Layout breakdown

- `NFS_WRAP` adds no element; it delegates the rendered hierarchy to `NotFound` with the spotlight branch selected.
- `NFS_PANEL` / `NFS_PANEL_BOX` is a responsive `16:9` grid capped at `36rem`. `NFS_BASE` and `NFS_MASK` occupy the same grid cell to create the spotlight overlay.
- The shared `NFS_COPY` and wrapping `NFS_ACTIONS` regions follow below in the main vertical flow. There are no sidebars, fixed/sticky elements, or scroll regions.
