---
title: TagSelector Styles (SASS)
description: Indented SASS stylesheet for custom tag selection dropdown overlays, labels, code syntax highlights, and focus borders.
---

# TagSelector Styles (SASS)

* **File Location**: `src/lib/components/TagSelector.sass`
* **Purpose**: Styles the dynamic dropdown list, selection option highlights, and triggers inside the right panel element properties. Follows pure tab-indented structure.

---

## Implementation

```sass
.tag-selector-field
	position: relative
	display: flex
	flex-direction: column
	gap: 6px
	padding: 12px
	border-bottom: 1px solid var(--border, #27272a)

	.tag-label
		font-size: 0.7rem
		font-weight: 500
		text-transform: uppercase
		letter-spacing: 0.05em
		color: var(--foreground-muted, #71717a)

.tag-trigger
	display: flex
	align-items: center
	justify-content: space-between
	height: 32px
	padding: 0 12px
	background: var(--input-bg, #09090b)
	border: 1px solid var(--border, #27272a)
	border-radius: 6px
	cursor: pointer
	transition: border-color 0.2s, background-color 0.2s
	width: 100%
	color: var(--foreground-primary, #f4f4f5)

	&:hover:not(:disabled)
		border-color: var(--accent-primary, #6366f1)
		background: var(--input-bg-hover, #18181b)

	&:disabled
		opacity: 0.5
		cursor: not-allowed

	&.active
		border-color: var(--accent-primary, #6366f1)

	.tag-code
		font-family: Menlo, Monaco, Consolas, monospace
		font-size: 0.75rem
		color: var(--accent-primary, #818cf8)

	.chevron-arrow
		font-size: 0.65rem
		color: var(--foreground-muted, #71717a)

.tag-dropdown
	position: absolute
	top: calc(100% - 4px)
	left: 12px
	right: 12px
	z-index: 100
	background: var(--dropdown-bg, #18181b)
	border: 1px solid var(--border, #27272a)
	border-radius: 6px
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4)
	padding: 6px 0
	display: flex
	flex-direction: column

	.dropdown-header
		padding: 6px 12px
		font-size: 0.65rem
		font-weight: 600
		text-transform: uppercase
		color: var(--foreground-muted, #71717a)
		border-bottom: 1px solid var(--border, #27272a)
		margin-bottom: 4px

	.options-list
		display: flex
		flex-direction: column
		max-height: 200px
		overflow-y: auto

		.option-item
			display: flex
			align-items: center
			justify-content: space-between
			height: 28px
			padding: 0 12px
			background: transparent
			border: none
			color: var(--foreground-secondary, #d4d4d8)
			cursor: pointer
			width: 100%
			text-align: left
			transition: background-color 0.2s, color 0.2s

			&:hover
				background: var(--accent-hover, #27272a)
				color: #ffffff

			&.selected
				background: var(--accent-active, #27272a)
				color: var(--accent-primary, #818cf8)

			.option-code
				font-family: Menlo, Monaco, Consolas, monospace
				font-size: 0.75rem

			.check-mark
				font-size: 0.7rem
```
