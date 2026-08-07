<script lang="ts">
	import BrowserShell from '$lib/modules/browser/components/BrowserShell.svelte';
	import '$lib/modules/browser/contributions';
	import { browserCurrentWindowId } from '$lib/ipc';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	// Do not construct BrowserWindowState until the native chrome webview identifies itself.
	// SvelteKit's route URL is a useful browser-preview fallback, but it is not authoritative
	// in a Tauri child webview during dev-server routing.
	let windowId = $state<string | null>(null);

	onMount(() => {
		void browserCurrentWindowId().then((nativeWindowId) => {
			windowId = nativeWindowId || page.url.searchParams.get('win') || 'main';
		}).catch((error) => {
			console.error('Could not identify browser chrome window:', error);
			windowId = page.url.searchParams.get('win') || 'main';
		});
	});
</script>

<svelte:head>
	<title>FractalEngine — Browser</title>
</svelte:head>

<div class="browser-standalone-view h100 w100 box overflow-hidden">
	{#if windowId}
		<BrowserShell {windowId} />
	{/if}
</div>
