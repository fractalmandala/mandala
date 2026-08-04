# NotFoundGlitch Layout Capture

**Source component:** `not-found-glitch.svelte`  
**Delegated layout and styles:** `not-found.svelte`, `not-found.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	NFG_WRAP["`**NotFoundGlitch wrapper**<br/>*(forwards all props; fixes variant to glitch; adds no DOM box)*`"]
	NFG_MAIN["`**NotFound main**<br/>*(centered vertical flex; min-height 26rem; space-5 gap; space-4 padding)*`"]
	NFG_CODE["`**glitch code heading**<br/>*(flex row; responsive clamp 5–11rem; one animated span per character)*`"]
	NFG_COPY["`**copy section**<br/>*(title plus description capped at 26rem)*`"]
	NFG_ACTIONS["`**recovery links**<br/>*(centered wrapping flex; space-3 gap; 2.75rem-high pills)*`"]
	NFG_WRAP --> NFG_MAIN
	NFG_MAIN --> NFG_CODE
	NFG_MAIN --> NFG_COPY
	NFG_MAIN --> NFG_ACTIONS
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph NFG_DELEGATE["NotFound component instance — variant=glitch"]
		direction TB
		subgraph NFG_MAIN_BOX["main[data-slot=not-found] — vertical flex"]
			direction TB
			subgraph NFG_CODE_BOX["h1[data-slot=not-found-code] — flex row"]
				direction LR
				NFG_CHAR["{#each} character span — repeated and animated"]
			end
			subgraph NFG_COPY_BOX["section[data-slot=not-found-copy]"]
				direction TB
				NFG_TITLE["h2 title"]
				NFG_DESCRIPTION["p description"]
			end
			subgraph NFG_ACTION_BOX["nav[data-slot=not-found-actions] — wrapping flex"]
				direction LR
				NFG_HOME["home link"]
				NFG_BROWSE["browse link"]
			end
		end
	end
```

## Layout breakdown

- `NFG_WRAP` is component composition only: the wrapper renders no element and delegates its full layout to `NotFound` with `variant="glitch"`.
- `NFG_CODE` maps to the selected default branch, where an `{#each}` block creates a horizontal span for every code character; responsive type uses `clamp(5rem, 18vw, 11rem)`.
- `NFG_COPY` and `NFG_ACTIONS` are the shared regions after the variant. Actions wrap on constrained widths; there are no sidebars, sticky/fixed elements, or scroll regions.
