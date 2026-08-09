<script lang="ts">
	import {
		openCommandPalette,
		openDialog,
		setEditorMode,
		shellPreferences,
		shellState,
		toggleSidebar,
		toggleTerminal,
	} from '$lib/shell';
	import ShellTitleBar from './ShellTitleBar.svelte';
</script>

<header class="toolbar">
	<ShellTitleBar />

	<div class="toolbar__row">
		<div class="toolbar__left">
			<button type="button" aria-label="Toggle sidebar" onclick={toggleSidebar}>☰</button>
			<div>
				<p>{$shellState.activeTarget.kind}</p>
				<h1>{$shellState.activeTarget.title}</h1>
			</div>
		</div>

		<div class="toolbar__actions" aria-label="Workspace actions">
			<span class="toolbar__status">{$shellPreferences.themeSource}</span>
			<button type="button" onclick={openCommandPalette}>⌘K</button>
			<div class="toolbar__segments" aria-label="Editor mode">
				<button
					type="button"
					class:active={$shellState.editorMode === 'rich'}
					onclick={() => setEditorMode('rich')}
				>Rich</button>
				<button
					type="button"
					class:active={$shellState.editorMode === 'source'}
					onclick={() => setEditorMode('source')}
				>Source</button>
				<button
					type="button"
					class:active={$shellState.editorMode === 'preview'}
					onclick={() => setEditorMode('preview')}
				>Preview</button>
			</div>
			<button type="button" onclick={toggleTerminal}>Terminal</button>
			<button type="button" onclick={() => openDialog('settings')}>Settings</button>
		</div>
	</div>
</header>

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.toolbar
		min-height: 64px
		border-bottom: 1px solid var(--ok-line)
		background: var(--ok-panel)
		color: var(--ok-ink)
		display: grid
		grid-template-rows: auto auto

		&__row
			padding: t.$space-3 t.$space-5
			// Never slide toolbar content under the macOS traffic lights:
			// the reserve is 5.25rem on macOS (via .platform-macos) and 1rem
			// elsewhere, so max() keeps the default padding on other platforms.
			padding-left: max(#{t.$space-5}, var(--ok-titlebar-reserve-left))
			display: flex
			align-items: center
			justify-content: space-between
			gap: t.$space-4

		&__left
			min-width: 0
			display: flex
			align-items: center
			gap: t.$space-3
			padding-left: 0
			-webkit-app-region: drag
			app-region: drag

			button
				-webkit-app-region: no-drag
				app-region: no-drag

			p
				margin: 0
				color: var(--ok-muted)
				font-size: t.$font-size-xs
				font-weight: 700
				text-transform: uppercase
				-webkit-app-region: drag
				app-region: drag

			h1
				margin: 2px 0 0
				color: var(--ok-ink)
				font-size: t.$font-size-lg
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap
				-webkit-app-region: drag
				app-region: drag

		&__actions
			display: flex
			align-items: center
			gap: t.$space-2
			-webkit-app-region: no-drag
			app-region: no-drag

		&__status
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-1 t.$space-2
			color: var(--ok-muted)
			font-size: t.$font-size-xs
			font-weight: 700
			text-transform: uppercase

		&__segments
			display: flex
			align-items: center
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			overflow: hidden

			button
				border: 0
				border-radius: 0
				background: transparent

				& + button
					border-left: 1px solid var(--ok-line)

				&.active
					background: var(--ok-accent)
					color: var(--ok-ink-inverse)

		button
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-1 t.$space-2
			background: var(--ok-surface)
			color: var(--ok-ink)
			cursor: pointer
			@include m.hover-transition(border-color)
			@include m.press-feedback

			&:hover
				border-color: var(--ok-accent)

			&:focus-visible
				@include m.focus-ring

	// (macOS traffic-light clearance is handled by var(--ok-titlebar-reserve-left)
	// on .toolbar__row above; no platform-qualified overrides needed.)

	@media (prefers-reduced-motion: reduce)
		button
			transition: none
</style>