# NotFound Layout Capture

**Source component:** `not-found.svelte`  
**Sibling styles:** `not-found.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	NF_ROOT["`**not-found main**<br/>*(centered vertical flex; min-height 26rem; space-5 gap; space-4 padding; text centered)*`"]
	NF_VARIANT["`**variant presentation**<br/>*(exclusive terminal, stacked, spotlight, or character-code branch)*`"]
	NF_TERMINAL["`**terminal panel**<br/>*(width min 28rem / 100%; clipped; header row plus vertical code lines)*`"]
	NF_STACK["`**stacked cards**<br/>*(relative 16rem × 11rem; three absolute overlapping layers)*`"]
	NF_SPOT["`**spotlight panel**<br/>*(grid overlay; width min 36rem / 100%; 16:9; overflow hidden)*`"]
	NF_CODE["`**code characters**<br/>*(flex heading; responsive clamp 5–11rem; {#each} character spans)*`"]
	NF_COPY["`**copy section**<br/>*(title plus description capped at 26rem)*`"]
	NF_ACTIONS["`**recovery links**<br/>*(centered wrapping flex row; space-3 gap; 2.75rem-high pills)*`"]
	NF_ROOT --> NF_VARIANT
	NF_VARIANT --> NF_TERMINAL
	NF_VARIANT --> NF_STACK
	NF_VARIANT --> NF_SPOT
	NF_VARIANT --> NF_CODE
	NF_ROOT --> NF_COPY
	NF_ROOT --> NF_ACTIONS
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph NF_MAIN_BOX["main[data-slot=not-found] — centered vertical flex"]
		direction TB
		subgraph NF_VARIANT_BOX["exclusive variant branch"]
			direction TB
			subgraph NF_TERMINAL_BOX["section[data-slot=not-found-terminal]"]
				direction TB
				NF_TERMINAL_HEADER["header — three dots and path label"]
				NF_TERMINAL_CODE["code — three vertical command/status lines"]
			end
			subgraph NF_STACK_BOX["div[data-slot=not-found-stack]"]
				direction TB
				NF_STACK_LAYERS["two decorative i layers plus h1 — absolute overlap"]
			end
			subgraph NF_SPOT_BOX["div[data-slot=not-found-spotlight] — single-cell grid"]
				direction TB
				NF_SPOT_LAYERS["background span and masked h1 — same grid area"]
			end
			NF_CODE_BOX["h1[data-slot=not-found-code] — repeated character spans"]
		end
		subgraph NF_COPY_BOX["section[data-slot=not-found-copy]"]
			direction TB
			NF_TITLE["h2 title"]
			NF_DESCRIPTION["p description"]
		end
		subgraph NF_ACTIONS_BOX["nav[data-slot=not-found-actions] — wrapping flex"]
			direction LR
			NF_HOME["home link"]
			NF_BROWSE["browse link"]
		end
	end
```

## Layout breakdown

- `NF_ROOT` / `NF_MAIN_BOX` defines the shared page-level vertical sequence: one visual variant, copy, then recovery navigation.
- `NF_VARIANT` contains exactly one conditional branch. Terminal uses a vertical panel, stacked uses absolute overlap, spotlight overlays two elements in one grid cell, and the default glitch/magnetic branch lays out code characters in a flex row.
- `NF_COPY` is a centered text block with a `26rem` description cap. `NF_ACTIONS` wraps its two links for narrower containers.
- Responsive sizing is source-driven through `min(..., 100%)`, `clamp(...)`, action wrapping, and the spotlight aspect ratio; no sticky/fixed or scroll region is declared.
