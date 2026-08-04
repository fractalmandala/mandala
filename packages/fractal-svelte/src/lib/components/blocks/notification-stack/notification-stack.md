# NotificationStack Layout Capture

**Source component:** `notification-stack.svelte`  
**Sibling styles:** `notification-stack.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	NS_BRANCH["`**notification output**<br/>*(empty status or populated stack)*`"]
	NS_EMPTY["`**empty state**<br/>*(width min 22rem / 100%; space-3 padding; centered text)*`"]
	NS_STACK["`**notification stack**<br/>*(width min 22rem / 100%; space-3 padding; rounded container)*`"]
	NS_CARDS["`**cards grid**<br/>*(space-1 gap; collapsed cards share grid area; expanded cards flow normally)*`"]
	NS_ITEM["`**notification card**<br/>*({#each} visible items; flex row; space-2 gap; stacked transforms when collapsed)*`"]
	NS_CONTENT["`**content column**<br/>*(flex: 1; min-width 0; title plus optional description)*`"]
	NS_TRAILING["`**trailing snippet**<br/>*(optional)*`"]
	NS_ACTION["`**item action**<br/>*(optional button)*`"]
	NS_FOOTER["`**footer control**<br/>*(100% flex row; count pill plus state label; top margin space-3)*`"]
	NS_BRANCH --> NS_EMPTY
	NS_BRANCH --> NS_STACK
	NS_STACK --> NS_CARDS --> NS_ITEM
	NS_ITEM --> NS_CONTENT
	NS_ITEM --> NS_TRAILING
	NS_ITEM --> NS_ACTION
	NS_STACK --> NS_FOOTER
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph NS_CONDITIONAL["{#if visible.length === 0}"]
		direction TB
		NS_EMPTY_BOX["div[data-slot=notification-empty] — empty branch"]
		subgraph NS_STACK_BOX["div[data-slot=notification-stack] — populated branch"]
			direction TB
			subgraph NS_CARDS_BOX["div[data-slot=notification-cards] — grid"]
				direction TB
				subgraph NS_ITEM_BOX["article[data-slot=notification-item] — repeated flex row"]
					direction LR
					NS_COPY_BOX["content div — title and optional description"]
					NS_TRAILING_BOX["optional trailing snippet span"]
					NS_ACTION_BOX["optional action button"]
				end
			end
			NS_FOOTER_BOX["footer button — count and open/collapsed label"]
		end
	end
```

## Layout breakdown

- `NS_BRANCH` / `NS_CONDITIONAL` captures the exclusive empty and populated branches.
- `NS_CARDS` is a grid: collapsed articles overlap at `grid-area: 1 / 1` with index-based translate/scale; expanded articles return to normal grid flow.
- Every `NS_ITEM` is a flex row containing a flexible text column and optional trailing/action siblings. Only the first overlapped card receives pointer events while collapsed.
- `NS_FOOTER` sits below the grid and contains a fixed `1.75rem` count pill. Width is capped at `22rem` and may shrink to `100%`; there are no breakpoints, fixed/sticky regions, or scroll containers.
