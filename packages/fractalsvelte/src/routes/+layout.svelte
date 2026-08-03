<script lang="ts">
	import "$lib/styles/index.sass";
	import "$lib/docs/theme-base.sass";
	import "$lib/docs/sizing.sass";
	import "$lib/highlight/shiki.sass";
	import "$lib/docs/docs.sass";
	import "$lib/docs/blocks.sass";
	import "$lib/docs/site.sass";
	import { ModeWatcher, mode } from "mode-watcher";
	import { theme } from "$lib/docs/theme.svelte";
	import Header from "$lib/docs/Header.svelte";
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
