<script lang="ts">
	// ── Native, library-free resizable panels ──────────────────────────────
	// Same technique as the drawer's height drag:
	//
	//   1. pointerdown → capture the pointer to THIS handle and record which
	//      panel is resizing. Pointer capture means we keep receiving move/up
	//      events even when the cursor outruns the thin handle or leaves the
	//      window — no global listeners, no lost drags.
	//
	//   2. pointermove → set the width DIRECTLY from the pointer's ABSOLUTE
	//      position relative to the container, not an accumulated delta.
	//      Absolute can't drift; delta-accumulation can.
	//
	//   3. The width is a $state bound to inline `style="width:…"`, and there is
	//      NO CSS transition on width. So every animation frame paints the panel
	//      exactly where the cursor is → perfectly smooth, zero lag. (A CSS
	//      transition on width here is what makes naive resizers feel laggy.)

	import { native } from '$lib/states/nativestate.svelte'
	import { slide } from 'svelte/transition'
	import { quadIn, quadOut, quintInOut, circIn } from 'svelte/easing'

	let containerEl = $state<HTMLElement | null>(null);
	let sidebarW = $state(240);
	let rightbarW = $state(280);
	let resizing = $state<'sidebar' | 'rightbar' | null>(null);

	const SIDEBAR = { min: 160, max: 480 };
	const RIGHTBAR = { min: 160, max: 480 };

	function startResize(which: 'sidebar' | 'rightbar', e: PointerEvent) {
		e.preventDefault();
		resizing = which;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onMove(e: PointerEvent) {
		if (!resizing || !containerEl) return;
		// Measure against the CONTAINER, not the window — robust to the header
		// offset and to the panels not being full-bleed.
		const rect = containerEl.getBoundingClientRect();

		if (resizing === 'sidebar') {
			// Left panel: width = distance from the container's LEFT edge.
			const w = e.clientX - rect.left;
			sidebarW = Math.min(SIDEBAR.max, Math.max(SIDEBAR.min, w));
		} else {
			// Right panel: width = distance from the container's RIGHT edge.
			const w = rect.right - e.clientX;
			rightbarW = Math.min(RIGHTBAR.max, Math.max(RIGHTBAR.min, w));
		}
	}

	function endResize(e: PointerEvent) {
		resizing = null;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* capture already released */
		}
	}
</script>

<section class="native-dragging" class:resizing={resizing !== null} bind:this={containerEl}>
	{#if !native.sidebarCollapsed}
	<aside class="panel sidebar" style="width: {sidebarW}px" in:slide={{ axis: 'x', easing: quadOut, duration: 200 }} out:slide={{ axis: 'x', easing: quadIn }}>
		<span class="panel-label">sidebar · {Math.round(sidebarW)}px</span>
		<!-- handle straddles the sidebar's RIGHT edge -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="resize-handle right"
			role="separator"
			aria-orientation="vertical"
			aria-label="Resize sidebar"
			onpointerdown={(e) => startResize('sidebar', e)}
			onpointermove={onMove}
			onpointerup={endResize}
			onpointercancel={endResize}
		></div>
	</aside>
	{/if}
	<main class="panel main box gap16">
		<span class="panel-label">main</span>
		<div class="row gap16">
			<button onclick={() => native.toggleSidebar()}>Sidebar {native.sidebarCollapsed}</button>
		<button onclick={() => native.toggleRightbar()}>Rightbar {native.rightbarCollapsed}</button>
		</div>
		<a href="/posts/draggable-collapsible">View Guide.</a>
	</main>
	{#if !native.rightbarCollapsed}
	<aside class="panel rightbar" style="width: {rightbarW}px" in:slide={{ axis: 'x', easing: quadOut, duration: 300 }} out:slide={{ axis: 'x', easing: quintInOut }}>
		<!-- handle straddles the rightbar's LEFT edge -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="resize-handle left"
			role="separator"
			aria-orientation="vertical"
			aria-label="Resize rightbar"
			onpointerdown={(e) => startResize('rightbar', e)}
			onpointermove={onMove}
			onpointerup={endResize}
			onpointercancel={endResize}
		></div>
		<span class="panel-label">rightbar · {Math.round(rightbarW)}px</span>
	</aside>
	{/if}
</section>

<style lang="sass">
	.native-dragging
		display: flex
		width: 100%
		height: calc(100dvh - var(--header-height) - var(--footer-height))
		overflow: hidden
		// While dragging, force the resize cursor everywhere and kill text
		// selection so a fast drag never highlights page text.
		&.resizing
			cursor: col-resize
			user-select: none

	.panel
		position: relative // anchors the absolutely-positioned handle
		display: flex
		align-items: center
		justify-content: center
		height: 100%
		box-sizing: border-box

	.sidebar
		flex: 0 0 auto // fixed width (set inline); never grow/shrink
		border-right: 1px solid var(--border-primary)

	.rightbar
		flex: 0 0 auto
		background: var(--background20)
		border-left: 1px solid var(--border-primary)

	.main
		flex: 1 1 0 // soaks up the remaining space
		min-width: 0 // lets it shrink below content width
		background: var(--background10)

	.panel-label
		font-size: 13px
		color: var(--text-secondary)
		user-select: none

	.resize-handle
		position: absolute
		top: 0
		bottom: 0
		height: 100%
		width: 1px // generous hit area, even though the line is 2px
		cursor: col-resize
		background: var(--border-primary)
		touch-action: none // stop the browser from claiming the gesture (scroll/zoom)
		z-index: 5
		display: flex
		align-items: center
		justify-content: center
		&:hover
			width: 2px
		&.right
			right: -1px // straddle the boundary so it's easy to grab
			&:hover::before
				background: var(--border-tertiary)
				width: 2px
		&.left
			left: -1px
			&:hover::before
				background: var(--border-tertiary)
				width: 2px
		&::before
			content: ''
			width: 1px
			height: 100%
			background: transparent
			transition: background 0.15s ease
</style>
