# FeedbackWidget Layout Capture

**Source component:** `feedback-widget.svelte`  
**Sibling styles:** `feedback-widget.sass`

## Diagram 1 — UI architecture and layout flow

```mermaid
graph TD
	FW_ROOT["`**feedback widget anchor**<br/>*(absolute; bottom space-4; left or right space-4; z-index 30)*`"]
	FW_CLOSED["`**closed trigger**<br/>*(conditional when idle; 3rem circular flex control; custom icon snippet or fallback SVG)*`"]
	FW_PANEL["`**open dialog panel**<br/>*(conditional when open; width min 20rem / 86vw; space-3 padding)*`"]
	FW_RESULT["`**result state**<br/>*(sent or error; centered vertical flex; space-2 gap; space-5 padding)*`"]
	FW_FORM["`**form state**<br/>*(header row, full-width textarea, footer row)*`"]
	FW_HEADER["`**header**<br/>*(flex row; title and close control; space-between)*`"]
	FW_TEXTAREA["`**message textarea**<br/>*(100% border-box width; vertical resize; space-3 margin and padding)*`"]
	FW_FOOTER["`**actions footer**<br/>*(flex row; end-aligned; cancel and submit)*`"]
	FW_ROOT --> FW_CLOSED
	FW_ROOT --> FW_PANEL
	FW_PANEL --> FW_RESULT
	FW_PANEL --> FW_FORM
	FW_FORM --> FW_HEADER
	FW_FORM --> FW_TEXTAREA
	FW_FORM --> FW_FOOTER
```

## Diagram 2 — DOM and CSS containment

```mermaid
flowchart TD
	subgraph FW_WIDGET_BOX["div[data-slot=feedback-widget] — absolute edge anchor"]
		direction TB
		FW_TRIGGER_BOX["button[data-slot=feedback-trigger] — closed branch"]
		subgraph FW_PANEL_BOX["div[data-slot=feedback-panel] — open branch dialog"]
			direction TB
			subgraph FW_RESULT_BOX["div[data-slot=feedback-result] — sent or error branch"]
				direction TB
				FW_RESULT_COPY["status heading and message"]
				FW_RETRY["retry button — error only"]
			end
			subgraph FW_FORM_BOX["default open branch"]
				direction TB
				FW_HEADER_ROW["header — title plus close"]
				FW_INPUT["textarea — full width"]
				FW_FOOTER_ROW["footer — cancel plus submit"]
			end
		end
	end
```

## Layout breakdown

- `FW_ROOT` / `FW_WIDGET_BOX` is an absolutely positioned bottom-corner anchor; `data-position` selects the physical left or right inset.
- The root conditionally contains either `FW_CLOSED` or `FW_PANEL`, never both. The trigger is a fixed `3rem` square; the panel is viewport-constrained to `86vw` with a `20rem` cap.
- Inside the panel, status selects `FW_RESULT` or the vertical `FW_FORM` sequence. Header and footer are flex rows, while the textarea fills the panel width and may resize vertically.
- The component has no breakpoint rules, sticky regions, or declared scroll container; its responsive sizing comes from `86vw`.
