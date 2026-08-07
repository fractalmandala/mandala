---
title: CanvasInspector Styles (SASS)
description: Indented SASS stylesheet containing visual rules for mouse pointer listeners, node highlights, and tooltip forms for the visual canvas annotation inspector.
---

# CanvasInspector Styles (SASS)

* **File Location**: `src/lib/components/CanvasInspector.sass`
* **Purpose**: Styles the pointer highlight boundaries, the absolute positioned comment dialog popups, and visual focus indicators. Contains only single-tab indented lines, no brackets, and no semicolons.

---

## Implementation

```sass
.inspector-stage-listener
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	pointer-events: none
	z-index: 150

	&.inspecting
		pointer-events: auto
		cursor: crosshair

.node-highlighter-ring
	position: absolute
	border: 1.5px solid var(--accent-primary, #6366f1)
	border-radius: 4px
	pointer-events: none
	box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.25)
	transition: all 0.1s ease-out

	.node-tag-badge
		position: absolute
		bottom: 100%
		left: 0
		background: var(--accent-primary, #6366f1)
		color: #ffffff
		font-family: monospace
		font-size: 0.65rem
		font-weight: 600
		padding: 2px 6px
		border-radius: 3px 3px 0 0
		line-height: 1

.annotation-popover
	position: absolute
	width: 280px
	background: var(--dropdown-bg, #18181b)
	border: 1px solid var(--border, #27272a)
	border-radius: 8px
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5)
	padding: 12px
	display: flex
	flex-direction: column
	gap: 10px
	pointer-events: auto
	z-index: 210

	.popover-meta
		font-size: 0.7rem
		color: var(--foreground-muted, #71717a)
		
		code
			font-family: monospace
			color: var(--accent-primary, #818cf8)

	.popover-textarea
		width: 100%
		background: var(--background-input, #09090b)
		border: 1px solid var(--border, #27272a)
		border-radius: 6px
		padding: 8px
		color: var(--foreground, #f4f4f5)
		font-size: 0.8rem
		outline: none
		resize: none
		transition: border-color 0.2s

		&:focus
			border-color: var(--accent-primary, #6366f1)

	.popover-actions
		display: flex
		align-items: center
		justify-content: flex-end
		gap: 8px

		.action-btn
			height: 28px
			padding: 0 12px
			font-size: 0.75rem
			font-weight: 500
			border-radius: 4px
			cursor: pointer
			border: none
			transition: background-color 0.2s, color 0.2s

			&.cancel
				background: transparent
				color: var(--foreground-muted, #71717a)

				&:hover
					color: var(--foreground, #f4f4f5)

			&.save
				background: var(--accent-primary, #6366f1)
				color: #ffffff

				&:hover:not(:disabled)
					background: var(--accent-hover, #4f46e5)

				&:disabled
					opacity: 0.5
					cursor: not-allowed
```
