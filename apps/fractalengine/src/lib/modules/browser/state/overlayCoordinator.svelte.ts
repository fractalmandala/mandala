// Overlay Coordinator — counting store for chrome overlay state (§3.10/B4)
//
// When any overlay (menu, popover, confirm dialog) opens it calls incrementOverlay();
// on close, decrementOverlay(). When the count crosses 0 → 1 the coordinator raises the
// chrome webview above the native content webview via browserSetChromeOverlay; on 1 → 0
// it lowers it again. The IPC call happens imperatively on the crossing — a module-scope
// `$effect` is illegal outside component init (it crashed the whole /browser route with
// `effect_orphan`), and a counter edge is imperative by nature anyway.
//
// This is a module-level singleton shared by all overlays in one chrome window. The shell
// registers its windowId on mount (`setOverlayWindowId`) so multi-window chrome doesn't
// address the wrong native window.

import { untrack } from 'svelte';
import { browserSetChromeOverlay } from '$lib/ipc';

let overlayCount = $state(0);
let overlayWindowId = 'main';

/** Called by BrowserShell on mount so overlay IPC addresses the right native window. */
export function setOverlayWindowId(windowId: string): void {
	overlayWindowId = windowId;
}

function setChromeOverlay(open: boolean): void {
	void browserSetChromeOverlay(overlayWindowId, open).catch(() => {
		// The native side may not have the window registered yet (mock/dev, early mount).
	});
}

// Both mutators run under `untrack`: `overlayCount += 1` is a read-modify-write, and callers
// invoke these from component `$effect`s — a tracked read there would make the effect depend
// on the very counter it mutates (infinite re-run, `effect_update_depth_exceeded`).

export function incrementOverlay(): void {
	untrack(() => {
		overlayCount += 1;
		if (overlayCount === 1) setChromeOverlay(true);
	});
}

export function decrementOverlay(): void {
	untrack(() => {
		if (overlayCount === 0) return;
		overlayCount -= 1;
		if (overlayCount === 0) setChromeOverlay(false);
	});
}

export function getOverlayCount(): number {
	return overlayCount;
}
