<script lang="ts">
	// Browser Launcher Card — replaces the old embedded Browser in canvas tiles, AI work panel,
	// IDE drawer, and app-level browser drawer (§3.6). Each context gets a themed CTA button
	// that either opens the standalone browser route or calls onOpen for panel-mode contexts.
	//
	// After the cutover (B5), the old Browser.svelte is deleted and every call site that
	// embedded it directly now renders this launcher card instead.
	import { isTauri, openBrowserWindow } from '$lib/ipc';

	interface Props {
		/** When true, opens the browser window in the OS (Tauri) rather than the route. */
		launchInWindow?: boolean;
		/** Panel-mode close callback (for IDE drawer). */
		onClose?: () => void;
	}

	let {
		launchInWindow = false,
		onClose,
	}: Props = $props();

	async function openBrowser() {
		// `window.open` cannot create a Tauri webview window. Always use the
		// tab-addressed browser engine when running in the desktop app, including
		// when this card is shown inside the app drawer.
		if (isTauri() || launchInWindow) {
			await openBrowserWindow('https://www.google.com');
			return;
		}

		window.open('/browser', '_blank', 'noopener,noreferrer');
	}
</script>

<div class="browser-launcher-card">
	<img src="/iconset/browse.svg" alt="" class="browser-launcher-icon" />
	<div class="browser-launcher-text">
		<strong>Browser</strong>
		<span>Open the standalone web browser</span>
	</div>
	<div class="browser-launcher-actions">
		<button class="btn-app" onclick={openBrowser}>
			<img src="/iconset/externalLink.svg" alt="" class="icon-svg-xs" />
			Open Browser
		</button>
		{#if onClose}
			<button class="btn-text" onclick={onClose}>Close</button>
		{/if}
	</div>
</div>
