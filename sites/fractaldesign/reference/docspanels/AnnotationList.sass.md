---
title: AnnotationList Styles (SASS)
description: Indented SASS stylesheet containing visual layouts for lists of active annotations, tag badges, empty states, and compile triggers.
---

# AnnotationList Styles (SASS)

* **File Location**: `src/lib/components/AnnotationList.sass`
* **Purpose**: Styles the annotation panels list, responsive layout cards, state indicators, and bottom execution buttons. Contains only single-tab indented lines, no brackets, and no semicolons.

---

## Implementation

```sass
.annotation-panel
	display: flex
	flex-direction: column
	height: 100%
	gap: 12px

	.panel-header
		padding: 4px 0
		border-bottom: 1px solid var(--border, #27272a)

		.title
			font-size: 0.75rem
			font-weight: 600
			text-transform: uppercase
			letter-spacing: 0.05em
			color: var(--foreground-muted, #71717a)

.annotations-list
	display: flex
	flex-direction: column
	gap: 8px
	overflow-y: auto
	flex: 1
	padding-right: 4px

	.empty-state
		display: flex
		flex-direction: column
		align-items: center
		justify-content: center
		height: 100%
		text-align: center
		gap: 8px
		padding: 24px 16px

		.icon
			font-size: 1.5rem

		.muted-text
			font-size: 0.75rem
			color: var(--foreground-muted, #71717a)
			line-height: 1.4

.annotation-item-card
	background: var(--card-bg, #202023)
	border: 1px solid var(--border, #27272a)
	border-radius: 6px
	padding: 10px
	display: flex
	flex-direction: column
	gap: 8px
	transition: all 0.2s ease
	
	&.solved
		opacity: 0.6
		border-color: rgba(16, 185, 129, 0.3)
		background: rgba(16, 185, 129, 0.02)

	.card-header
		display: flex
		align-items: center
		justify-content: space-between

		.tag-badge
			font-size: 0.65rem
			
			code
				font-family: monospace
				color: var(--accent-primary, #818cf8)

		.status-tag
			font-size: 0.6rem
			font-weight: 600
			text-transform: uppercase
			padding: 2px 6px
			border-radius: 9999px
			background: var(--border, #3f3f46)
			color: var(--foreground-muted, #a1a1aa)
			
			&.resolved
				background: rgba(16, 185, 129, 0.15)
				color: #10b981

	.card-prompt
		font-size: 0.75rem
		color: var(--foreground-secondary, #d4d4d8)
		line-height: 1.3
		margin: 0

	.card-footer
		display: flex
		align-items: center
		justify-content: flex-end
		gap: 12px
		border-top: 1px dashed var(--border, #27272a)
		padding-top: 8px

		.footer-btn
			background: transparent
			border: none
			cursor: pointer
			font-size: 0.7rem
			font-weight: 500
			padding: 0
			transition: color 0.2s

			&.focus-btn
				color: var(--accent-primary, #6366f1)

				&:hover
					color: var(--accent-hover, #818cf8)

			&.delete-btn
				color: var(--foreground-muted, #71717a)

				&:hover
					color: var(--destructive, #ef4444)

.panel-actions
	border-top: 1px solid var(--border, #27272a)
	padding-top: 12px

	.compile-btn
		width: 100%
		height: 36px
		border-radius: 6px
		background: var(--accent-primary, #6366f1)
		color: #ffffff
		font-size: 0.8rem
		font-weight: 600
		cursor: pointer
		border: none
		transition: background-color 0.2s
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2)

		&:hover:not(:disabled)
			background: var(--accent-hover, #4f46e5)

		&:disabled
			opacity: 0.5
			cursor: not-allowed
```
