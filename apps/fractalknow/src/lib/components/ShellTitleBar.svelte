<script lang="ts">
	// Title-bar strip above the shell chrome.
	//
	// On Tauri the strip carries data-tauri-drag-region so the OS can drag the
	// window from it; the browser preview degrades to a static header band
	// (drag semantics are meaningless outside the native webview).
	//
	// Height comes from --ok-titlebar-reserve-top; macOS traffic-light clearance
	// on the left is handled by --ok-titlebar-reserve-left, which flips to
	// 5.25rem when AppShell sets the canonical .platform-macos class on <html>.
	import { desktopBridge } from '$lib/desktop';

	const isTauri = $derived($desktopBridge.status === 'ready' && $desktopBridge.bridge.runtime === 'tauri');
</script>

<div
	class="titlebar"
	data-tauri-drag-region={isTauri ? '' : null}
	aria-hidden="true"
></div>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.titlebar
		height: var(--ok-titlebar-reserve-top, #{t.$ok-titlebar-reserve-top})
		min-height: var(--ok-titlebar-reserve-top, #{t.$ok-titlebar-reserve-top})
		background: transparent
		border-bottom: 1px solid var(--ok-line)

		// Drag region is only honored by the native webview; in the browser
		// preview the attribute is absent and the band is purely static.
		&[data-tauri-drag-region]
			-webkit-app-region: drag
			app-region: drag
</style>
