---
title: ComponentRegistry Styles (SASS)
description: Indented SASS stylesheet containing grid structures, search controls, and card hover animations for the component registry library.
---

# ComponentRegistry Styles (SASS)

* **File Location**: `src/lib/components/ComponentRegistry.sass`
* **Purpose**: Styles the component grids and hover state transitions within the sidebar selector panel. Follows pure tab-indented syntax without brackets or semicolons.

---

## Implementation

```sass
.component-registry
	display: flex
	flex-direction: column
	height: 100%
	gap: 12px

	.search-box
		margin-bottom: 4px

		.search-input
			width: 100%
			height: 32px
			border-radius: 6px
			border: 1px solid var(--border, #27272a)
			background: var(--background-input, #09090b)
			color: var(--foreground, #f4f4f5)
			padding: 0 10px
			font-size: 0.8rem
			outline: none
			transition: border-color 0.2s

			&:focus
				border-color: var(--accent-primary, #6366f1)

.components-grid
	display: grid
	grid-template-columns: repeat(2, 1fr)
	gap: 8px

.component-card
	display: flex
	flex-direction: column
	align-items: flex-start
	padding: 10px
	background: var(--card-bg, #202023)
	border: 1px solid var(--border, #27272a)
	border-radius: 6px
	cursor: grab
	user-select: none
	text-align: left
	transition: border-color 0.2s, background-color 0.2s
	gap: 6px
	width: 100%
	
	&:hover
		border-color: var(--accent-primary, #6366f1)
		background: var(--card-bg-hover, #2d2d30)
		
	&:active
		cursor: grabbing

	.card-icon
		font-size: 1.25rem
		color: var(--foreground-muted, #a1a1aa)

	.card-meta
		display: flex
		flex-direction: column
		gap: 2px

		.card-label
			font-size: 0.75rem
			font-weight: 600
			color: var(--foreground-primary, #f4f4f5)

		.card-desc
			font-size: 0.65rem
			color: var(--foreground-muted, #71717a)
			line-height: 1.2
```
