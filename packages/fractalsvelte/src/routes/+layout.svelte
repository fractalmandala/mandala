<script lang="ts">
	import "$lib/styles/index.sass";
	import "$lib/docshell/theme-base.sass";
	import "$lib/docshell/sizing.sass";
	import "$lib/highlight/shiki.sass";
	import "$lib/docshell/docs.sass";
	import "$lib/docshell/blocks.sass";
	import "$lib/docshell/site.sass";
	import { ModeWatcher, mode } from "mode-watcher";
	import { theme } from "$lib/docshell/theme.svelte";
	import Header from "$lib/docshell/Header.svelte";
	import { Toaster } from "$lib/components/sonner/index.js";

	let { children } = $props();

	// Re-apply the selected palette whenever the palette or the resolved light/dark mode changes.
	$effect(() => {
		theme.apply(mode.current ?? "light");
	});
</script>

<ModeWatcher />
<Toaster />

<div class="app-shell">
	<Header />
	{@render children()}
</div>
