---
title: TemplateDock Styles (SASS)
description: Indented SASS stylesheet containing visual layouts, popover overlays, card designs, and backdrop shadows for the layout template dock.
---

# TemplateDock Styles (SASS)

* **File Location**: `src/lib/components/TemplateDock.sass`
* **Purpose**: Styles the layout template picker bottom dock drawer, thumbnail grids, and closing elements. Follows single-tab indented structure.

---

## Implementation

```sass
.template-dock-container
	position: relative
	display: inline-block

.dock-launcher
	display: flex
	align-items: center
	gap: 8px
	height: 36px
	padding: 0 16px
	background: var(--background-secondary, #18181b)
	border: 1px solid var(--border, #27272a)
	border-radius: 9999px
	color: var(--foreground-primary, #f4f4f5)
	cursor: pointer
	font-size: 0.8rem
	font-weight: 500
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
	transition: background-color 0.2s, border-color 0.2s

	&:hover
		background: var(--background-active, #27272a)
		border-color: var(--accent-primary, #6366f1)

	&.active
		background: var(--accent-primary, #6366f1)
		border-color: var(--accent-primary, #6366f1)
		color: #ffffff

	.launcher-icon
		font-size: 0.95rem

.templates-overlay
	position: absolute
	bottom: 48px
	left: 50%
	transform: translateX(-50%)
	width: 440px
	background: var(--dropdown-bg, #18181b)
	border: 1px solid var(--border, #27272a)
	border-radius: 8px
	box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5)
	padding: 16px
	display: flex
	flex-direction: column
	gap: 12px
	z-index: 200

	.overlay-header
		display: flex
		align-items: center
		justify-content: space-between
		border-bottom: 1px solid var(--border, #27272a)
		padding-bottom: 8px

		.title
			font-size: 0.8rem
			font-weight: 600
			color: var(--foreground-primary, #f4f4f5)

		.close-btn
			background: transparent
			border: none
			color: var(--foreground-muted, #71717a)
			font-size: 1.25rem
			cursor: pointer
			padding: 0 4px
			line-height: 1

			&:hover
				color: var(--foreground, #f4f4f5)

.templates-grid
	display: grid
	grid-template-columns: repeat(2, 1fr)
	gap: 10px

.template-item-card
	display: flex
	align-items: flex-start
	gap: 10px
	padding: 10px
	background: var(--card-bg, #202023)
	border: 1px solid var(--border, #27272a)
	border-radius: 6px
	cursor: pointer
	text-align: left
	width: 100%
	transition: border-color 0.2s, background-color 0.2s

	&:hover
		border-color: var(--accent-primary, #6366f1)
		background: var(--card-bg-hover, #2d2d30)

	.template-icon
		font-size: 1.5rem
		padding: 4px
		background: var(--background-secondary, #18181b)
		border-radius: 4px
		border: 1px solid var(--border, #27272a)

	.template-meta
		display: flex
		flex-direction: column
		gap: 2px
		overflow: hidden

		.template-name
			font-size: 0.75rem
			font-weight: 600
			color: var(--foreground-primary, #f4f4f5)
			white-space: nowrap
			overflow: hidden
			text-overflow: ellipsis

		.template-desc
			font-size: 0.65rem
			color: var(--foreground-muted, #71717a)
			line-height: 1.2
```
