---
title: Draggable Width or Height and Collapsible Panels
description: How to use draggable width/height in Sveltekit, and collapsible panels.
tags:
  - webdev
  - sveltekit
---

[Demo](/play/native-dragging).

To be able to drag the width of a panel, or height of a bottom drawer, we need to detect and read 3 events
- pointer down (when a draggable edged is clicked): capture the pointer to record which panel is resizing. And since we're watching this, we can receive two more event reads:
- pointer move and pointer up: the first helps know when something is being dragged, the second tells us when the dragging stops.
- pointer move also tells us what a width/height is dragged to, from what value. 

To tie this to a class, say sidebar, in the script tag of a Sveltekit page/component:

```ts
let sidebarW = $state(120)
```

and in the markup:

```html
<div class="sidebar" style="width: {sidebarW}px">
sidebar
</div>
```

That's it! Perfectly smooth, zero lag.

## Collapsibles

Now say you want both the side panels to also be collapsible. It's time to build a window state. In a separate, .svelte.ts file (I usually use nativestate.svelte.ts):

1. Define the storage key (if you want states to persist), type, and interface:

```ts
const STORAGE_KEY = 'fractaldesign:statesample'
export type NativeLayout = 'sidebar' | 'rightbar'
interface PersistedLayout {
	sidebarCollapsed: boolean;
	rightbarCollapsed: boolean;
	sidebarExpanded: number;
	rightbarExpanded: number;
}
```

The NativeLayout type contants all the panels that will shift/transform/collapse in our layout. This example is simple - just 2 such panels - but you can make performant and dynamic ones with various panels, popovers, and nested layouts.
If we want the layout to persist - ie, panels you collapse stay collapsed on reloads or restars, that's what the interface is for. 

Notice - we add values for the two panels' widths also. Load that persisted layout:

```ts
function loadPersisted(): Partial<PersistedLayout> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Partial<PersistedLayout>) : {};
	} catch {
		return {};
	}
}
```

And then we build the state class:

```ts
class NativeState {
	sidebarCollapsed = $state(false);
	rightbarCollapsed = $state(false);
	sidebarExpanded = $state(240);
	rightbarExpanded = $state(280);

	constructor() {
		const p = loadPersisted();
		this.sidebarCollapsed = p.sidebarCollapsed ?? false;
		this.rightbarCollapsed = p.rightbarCollapsed ?? false;
		if (typeof p.sidebarExpanded === 'number') this.sidebarExpanded = p.sidebarExpanded;
		if (typeof p.rightbarExpanded === 'number') this.rightbarExpanded = p.rightbarExpanded;
	}

	setCollapsed(panel: NativeLayout, collapsed: boolean): void {
		if (panel === 'sidebar') this.sidebarCollapsed = collapsed;
		else if (panel === 'rightbar') this.rightbarCollapsed = collapsed;
		this.persist();
	}

	toggleSidebar(): void {
		this.sidebarCollapsed = !this.sidebarCollapsed;
		this.persist();
	}

	toggleRightbar(): void {
		this.rightbarCollapsed = !this.rightbarCollapsed;
		this.persist();
	}

	persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const snapshot: PersistedLayout = {
				sidebarCollapsed: this.sidebarCollapsed,
				rightbarCollapsed: this.rightbarCollapsed,
				sidebarExpanded: this.sidebarExpanded,
				rightbarExpanded: this.rightbarExpanded,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// Ignore storage failures.
		}
	}
}
```

What's happening here: 
1. We declare the starting, default state - what is collapsed/or not collapsed, what is default width of panels. (if you're planning a horizontally collapsible/draggable element, then you'll use height).
2. Inside the constructor, we check if there's any saved layout data in localStorage. If there is, we hydrate our reactive $state variables with those saved user preferences on page load so everything stays right where they left it.
3. We expose clean modifier methods like setCollapsed(), toggleSidebar(), and toggleRightbar(). Every time these run, they flip our reactive booleans and instantly trigger persist().
4. The persist() method takes a clean snapshot of our current reactive states, stringifies it, and saves it right back to localStorage.

By decoupling this layout state into a standalone class, we ensure that if a user navigates between routes or different SvelteKit pages, our sidebars don’t awkwardly flash, jump, or reset to defaults.

Now, let's tie this global state and our mouse-tracking logic together inside the main Svelte component.

## Component Layout

To get that ultra-smooth, library-free dragging action, we use a clever browser trick: Pointer Capture. Instead of listening to global window events (which can lag or drop if your cursor moves too fast for the handle), we capture the pointer directly on the handler element.

Here is how the script section looks using Svelte 5 runes:

```ts
    import { native } from '$lib/states/nativestate.svelte'
    import { slide } from 'svelte/transition'
    import { quadIn, quadOut, quintInOut } from 'svelte/easing'
    let containerEl = $state<HTMLElement | null>(null);
    let sidebarW = $state(240);
    let rightbarW = $state(280);
    let resizing = $state<'sidebar' | 'rightbar' | null>(null);

    // Establish reasonable boundaries so users don't break the layout
    const SIDEBAR = { min: 160, max: 480 };
    const RIGHTBAR = { min: 160, max: 480 };

    function startResize(which: 'sidebar' | 'rightbar', e: PointerEvent) {
        e.preventDefault();
        resizing = which;
        // This is the magic bullet: locks the cursor to this element 
        // so fast movements don't break the drag gesture.
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onMove(e: PointerEvent) {
        if (!resizing || !containerEl) return;
        
        // Measure against the container bounding box rather than the window.
        // This makes it perfectly robust against headers or page offsets.
        const rect = containerEl.getBoundingClientRect();

        if (resizing === 'sidebar') {
            const w = e.clientX - rect.left;
            sidebarW = Math.min(SIDEBAR.max, Math.max(SIDEBAR.min, w));
        } else {
            const w = rect.right - e.clientX;
            rightbarW = Math.min(RIGHTBAR.max, Math.max(RIGHTBAR.min, w));
        }
    }

    function endResize(e: PointerEvent) {
        resizing = null;
        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
            // Capture already released or redundant
        }
    }
```

With the math safely tucked into our move handlers, our markup just needs to apply these values inline.

Notice that we use Svelte's native transition:slide on the horizontal axis (axis: 'x'). When a user clicks a button to toggle native.sidebarCollapsed, Svelte takes over with clean animations. But while dragging, we bind it's with inline style to the sidebarW we set with zero CSS transitions interfering. That's why it stays perfectly responsive.

```html
<section class="native-dragging" class:resizing={resizing !== null} bind:this={containerEl}>
    {#if !native.sidebarCollapsed}
    <aside class="panel sidebar" style="width: {sidebarW}px" in:slide={{ axis: 'x', easing: quadOut, duration: 200 }} out:slide={{ axis: 'x', easing: quadIn }}>
        <span class="panel-label">sidebar · {Math.round(sidebarW)}px</span>
        
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

    <main class="panel main">
        <span class="panel-label">main</span>
        <button onclick={() => native.toggleSidebar()}>Sidebar {native.sidebarCollapsed}</button>
        <button onclick={() => native.toggleRightbar()}>Rightbar {native.rightbarCollapsed}</button>
    </main>

    {#if !native.rightbarCollapsed}
    <aside class="panel rightbar" style="width: {rightbarW}px" in:slide={{ axis: 'x', easing: quadOut, duration: 300 }} out:slide={{ axis: 'x', easing: quintInOut }}>
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
```

## Styling

To bring it all together, we need a layout structure that lets the center main panel adapt while the sidebars remain strict on their pixel widths. A combination of flex: 0 0 auto on the panels and flex: 1 1 0 on the main panel does exactly that.

We also add a resizing utility class to the global wrapper. While a drag is active, it forces a col-resize cursor across the whole screen and disables text selection. No accidental text highlighting, no broken immersion.

(I style in SASS, not CSS/SCSS, sorry!)

```sass
.native-dragging
    display: flex
    width: 100%
    height: calc(100dvh - var(--header-height) - var(--footer-height))
    overflow: hidden
    
    &.resizing
        cursor: col-resize
        user-select: none

.panel
    position: relative // Anchors the absolute resize handle
    display: flex
    align-items: center
    justify-content: center
    height: 100%
    box-sizing: border-box

.sidebar
    flex: 0 0 auto 
    border-right: 1px solid var(--border-primary)

.rightbar
    flex: 0 0 auto
    background: var(--background20)
    border-left: 1px solid var(--border-primary)

.main
    flex: 1 1 0 // Soaks up whatever space remains
    min-width: 0 
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
    width: 1px 
    cursor: col-resize
    background: var(--border-primary)
    touch-action: none // Prevents mobile browser gestures from intercepting
    z-index: 5
    display: flex
    align-items: center
    justify-content: center
    &:hover
        width: 2px
    &.right
        right: -1px // Straddle the layout boundary perfectly
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
```

And there you have it. High-performance, memory-retaining, collapsible layouts using pure platform APIs and Svelte mechanics. No heavy external UI libraries required.

But! If you just want it easy and simple, without have to worry about state management yourself, [Paneforge](https://paneforge.com/docs) is simply perfect. A demo implementation of that is [here](/play/paneforge).
