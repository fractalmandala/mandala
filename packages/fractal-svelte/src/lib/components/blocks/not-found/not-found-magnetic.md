# NotFoundMagnetic Layout Capture

**Source component:** `not-found-magnetic.svelte`  
**Delegated layout and styles:** `not-found.svelte`, `not-found.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	NFM_WRAP["`**NotFoundMagnetic wrapper**<br/>*(forwards all props; fixes variant to magnetic; adds no DOM box)*`"]
	NFM_MAIN["`**NotFound main**<br/>*(centered vertical flex; min-height 26rem; space-5 gap; space-4 padding)*`"]
	NFM_CODE["`**magnetic code heading**<br/>*(flex row; responsive clamp 5–11rem; one translated span per character)*`"]
	NFM_POINTER["`**pointer-relative transform**<br/>*(main sets shared x/y offsets; character spans translate together)*`"]
	NFM_COPY["`**copy section**<br/>*(title plus description capped at 26rem)*`"]
	NFM_ACTIONS["`**recovery links**<br/>*(centered wrapping flex; space-3 gap)*`"]
	NFM_WRAP --> NFM_MAIN
	NFM_MAIN --> NFM_CODE
	NFM_CODE -. pointer movement .-> NFM_POINTER
	NFM_MAIN --> NFM_COPY
	NFM_MAIN --> NFM_ACTIONS
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph NFM_DELEGATE["NotFound component instance — variant=magnetic"]
		direction TB
		subgraph NFM_MAIN_BOX["main[data-slot=not-found] — vertical flex"]
			direction TB
			subgraph NFM_CODE_BOX["h1[data-slot=not-found-code] — flex row"]
				direction LR
				NFM_CHAR["{#each} character span — repeated; magnetic translate"]
			end
			subgraph NFM_COPY_BOX["section[data-slot=not-found-copy]"]
				direction TB
				NFM_TITLE["h2 title"]
				NFM_DESCRIPTION["p description"]
			end
			subgraph NFM_ACTION_BOX["nav[data-slot=not-found-actions] — wrapping flex"]
				direction LR
				NFM_HOME["home link"]
				NFM_BROWSE["browse link"]
			end
		end
	end
```

## Layout breakdown

- `NFM_WRAP` contributes no DOM boundary; it delegates to `NotFound` and locks the magnetic branch.
- `NFM_CODE` is a flex heading generated with `{#each}`. Its character spans retain document flow while pointer-derived CSS variables translate them visually.
- `NFM_COPY` follows with capped description width, then `NFM_ACTIONS` wraps two links in a centered row. Responsive type uses viewport-relative `clamp`; there are no sidebars, fixed/sticky elements, or scroll regions.
