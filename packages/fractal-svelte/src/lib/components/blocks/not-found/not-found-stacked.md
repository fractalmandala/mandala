# NotFoundStacked Layout Capture

**Source component:** `not-found-stacked.svelte`  
**Delegated layout and styles:** `not-found.svelte`, `not-found.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	NFST_WRAP["`**NotFoundStacked wrapper**<br/>*(forwards all props; fixes variant to stacked; adds no DOM box)*`"]
	NFST_MAIN["`**NotFound main**<br/>*(centered vertical flex; min-height 26rem; space-5 gap; space-4 padding)*`"]
	NFST_STACK["`**stack presentation**<br/>*(relative 16rem × 11rem boundary)*`"]
	NFST_BACK1["`**rear card 1**<br/>*(absolute inset; decorative; fans left on hover)*`"]
	NFST_BACK2["`**rear card 2**<br/>*(absolute inset; decorative; fans right on hover)*`"]
	NFST_FRONT["`**front code card**<br/>*(absolute inset grid; centers 5rem code)*`"]
	NFST_COPY["`**copy section**<br/>*(title plus description capped at 26rem)*`"]
	NFST_ACTIONS["`**recovery links**<br/>*(centered wrapping flex; space-3 gap)*`"]
	NFST_WRAP --> NFST_MAIN
	NFST_MAIN --> NFST_STACK
	NFST_STACK --> NFST_BACK1
	NFST_STACK --> NFST_BACK2
	NFST_STACK --> NFST_FRONT
	NFST_MAIN --> NFST_COPY
	NFST_MAIN --> NFST_ACTIONS
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph NFST_DELEGATE["NotFound component instance — variant=stacked"]
		direction TB
		subgraph NFST_MAIN_BOX["main[data-slot=not-found] — vertical flex"]
			direction TB
			subgraph NFST_STACK_BOX["div[data-slot=not-found-stack] — relative fixed-size box"]
				direction TB
				NFST_LAYER_ONE["i — absolute decorative card"]
				NFST_LAYER_TWO["i — absolute decorative card"]
				NFST_CODE_CARD["h1 — absolute front card and centered code"]
			end
			subgraph NFST_COPY_BOX["section[data-slot=not-found-copy]"]
				direction TB
				NFST_TITLE["h2 title"]
				NFST_DESCRIPTION["p description"]
			end
			subgraph NFST_ACTION_BOX["nav[data-slot=not-found-actions] — wrapping flex"]
				direction LR
				NFST_HOME["home link"]
				NFST_BROWSE["browse link"]
			end
		end
	end
```

## Layout breakdown

- `NFST_WRAP` is a DOM-transparent wrapper around `NotFound` with the stacked branch selected.
- `NFST_STACK` / `NFST_STACK_BOX` is a `16rem × 11rem` relative boundary. Both decorative cards and the code card are absolutely inset to overlap; hover transforms fan the layers without changing flow.
- `NFST_COPY` and `NFST_ACTIONS` remain in normal vertical flow below the stack, with a capped description and wrapping action row. No sticky/fixed or scroll regions are declared.
