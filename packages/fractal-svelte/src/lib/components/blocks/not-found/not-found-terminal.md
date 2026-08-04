# NotFoundTerminal Layout Capture

**Source component:** `not-found-terminal.svelte`  
**Delegated layout and styles:** `not-found.svelte`, `not-found.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	NFT_WRAP["`**NotFoundTerminal wrapper**<br/>*(forwards all props; fixes variant to terminal; adds no DOM box)*`"]
	NFT_MAIN["`**NotFound main**<br/>*(centered vertical flex; min-height 26rem; space-5 gap; space-4 padding)*`"]
	NFT_PANEL["`**terminal panel**<br/>*(width min 28rem / 100%; overflow hidden; left-aligned)*`"]
	NFT_HEADER["`**window header**<br/>*(flex row; space-2 gap; space-3/4 padding; three dots and path)*`"]
	NFT_CODE["`**terminal body**<br/>*(vertical flex; space-2 gap; space-4 padding; three animated lines)*`"]
	NFT_COPY["`**copy section**<br/>*(title plus description capped at 26rem)*`"]
	NFT_ACTIONS["`**recovery links**<br/>*(centered wrapping flex; space-3 gap)*`"]
	NFT_WRAP --> NFT_MAIN
	NFT_MAIN --> NFT_PANEL
	NFT_PANEL --> NFT_HEADER
	NFT_PANEL --> NFT_CODE
	NFT_MAIN --> NFT_COPY
	NFT_MAIN --> NFT_ACTIONS
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph NFT_DELEGATE["NotFound component instance — variant=terminal"]
		direction TB
		subgraph NFT_MAIN_BOX["main[data-slot=not-found] — vertical flex"]
			direction TB
			subgraph NFT_PANEL_BOX["section[data-slot=not-found-terminal] — clipped panel"]
				direction TB
				subgraph NFT_HEADER_BOX["header — flex row"]
					direction LR
					NFT_DOTS["three i status dots"]
					NFT_PATH["path label"]
				end
				subgraph NFT_CODE_BOX["code — vertical flex"]
					direction TB
					NFT_LINE_ONE["command line"]
					NFT_LINE_TWO["error line"]
					NFT_LINE_THREE["status line plus caret"]
				end
			end
			subgraph NFT_COPY_BOX["section[data-slot=not-found-copy]"]
				direction TB
				NFT_TITLE["h2 title"]
				NFT_DESCRIPTION["p description"]
			end
			subgraph NFT_ACTION_BOX["nav[data-slot=not-found-actions] — wrapping flex"]
				direction LR
				NFT_HOME["home link"]
				NFT_BROWSE["browse link"]
			end
		end
	end
```

## Layout breakdown

- `NFT_WRAP` adds no DOM node; it delegates to `NotFound` with the terminal branch fixed.
- `NFT_PANEL` is capped at `28rem` and may shrink to `100%`. Its DOM/CSS boundaries divide into the horizontal `NFT_HEADER` and vertical `NFT_CODE` body.
- The header contains three fixed `0.75rem` dots and a path label; the body contains three lines, with a small inline caret on the final line.
- Shared copy and wrapping recovery actions follow the panel. There are no sticky/fixed regions, sidebars, or scroll containers.
