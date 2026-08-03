---
title: LeftSidebar Styles (SASS)
description: Indented SASS stylesheet for styling the stacked left sidebar, resize handles, AI chat panes, and collapsible transitions.
---

# LeftSidebar Styles (SASS)

* **File Location**: `src/lib/components/LeftSidebar.sass`
* **Purpose**: Styles the stacked panels, handles resize grabbing hover states, and animations for collapsing/expanding sidebars. Contains only single-tab indented lines, no brackets, and no semicolons.

---

## Implementation

```sass
.left-sidebar
	display: flex
	flex-direction: column
	width: 320px
	height: 100%
	background: var(--background-secondary, #18181b)
	border-right: 1px solid var(--border, #27272a)
	overflow: hidden
	transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s
	opacity: 1

	&.collapsed
		width: 0px
		opacity: 0
		pointer-events: none
		border-right: none

.sidebar-pane
	width: 100%
	display: flex
	flex-direction: column
	overflow: hidden

	.pane-tabs-header
		display: flex
		border-bottom: 1px solid var(--border, #27272a)
		padding: 8px 12px
		gap: 8px

		.tab-trigger
			background: transparent
			border: none
			color: var(--foreground-muted, #71717a)
			cursor: pointer
			font-size: 0.8rem
			font-weight: 500
			padding: 4px 8px
			border-radius: 4px
			transition: background-color 0.2s, color 0.2s

			&:hover
				color: var(--foreground, #f4f4f5)

			&.active
				background: var(--background-active, #27272a)
				color: var(--foreground, #f4f4f5)

	.pane-content
		flex: 1
		overflow-y: auto
		padding: 12px

.sidebar-resizer
	height: 8px
	cursor: row-resize
	display: flex
	align-items: center
	justify-content: center
	user-select: none
	background: transparent
	transition: background-color 0.2s ease
	
	&:hover, &.active
		background: var(--accent-hover, #27272a)
		
		.resizer-knob
			background: var(--accent-primary, #6366f1)

	.resizer-knob
		width: 40px
		height: 3px
		border-radius: 2px
		background: var(--border, #3f3f46)
		transition: background-color 0.2s ease

.chat-pane
	background: var(--background-chat, #09090b)
	border-top: 1px solid var(--border, #27272a)
	display: flex
	flex-direction: column

	.pane-header
		padding: 10px 12px
		border-bottom: 1px solid var(--border, #27272a)

		.header-title
			font-size: 0.75rem
			font-weight: 600
			text-transform: uppercase
			letter-spacing: 0.05em
			color: var(--foreground-muted, #71717a)

	.chat-viewport
		flex: 1
		overflow-y: auto
		padding: 12px

		.chat-placeholder
			display: flex
			flex-direction: column
			align-items: center
			justify-content: center
			height: 100%
			text-align: center
			gap: 8px
			padding: 0 16px

			.assistant-avatar
				font-size: 1.5rem

			.muted-text
				font-size: 0.75rem
				color: var(--foreground-muted, #71717a)
				line-height: 1.4

	.chat-input-bar
		padding: 12px
		border-top: 1px solid var(--border, #27272a)

		.chat-input
			width: 100%
			height: 32px
			border-radius: 6px
			border: 1px solid var(--border, #27272a)
			background: var(--background-input, #18181b)
			color: var(--foreground, #f4f4f5)
			padding: 0 10px
			font-size: 0.8rem
			outline: none
			transition: border-color 0.2s

			&:focus
				border-color: var(--accent-primary, #6366f1)
```
