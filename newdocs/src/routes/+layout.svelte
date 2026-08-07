<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/index.sass';
	import 'virtual:fractals-styler.css';
	import { ModeWatcher, mode, systemPrefersMode } from 'mode-watcher';

	let { children } = $props();

	/** Resolved light | dark for CSS (mode-watcher uses .dark / .light on <html>). */
	const resolvedMode = $derived.by(() => {
		const m = mode.current;
		if (m === 'dark' || m === 'light') return m;
		return systemPrefersMode.current === 'dark' ? 'dark' : 'light';
	});

	// Keep data-theme in sync so token selectors always match user intent
	// (media-query dark must not win over an explicit light choice).
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.dataset.theme = resolvedMode;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#039140" />
</svelte:head>

<!--
  lightClassNames is required: without .light, prefers-color-scheme:dark keeps
  dark tokens even after the user picks light mode.
-->
<ModeWatcher
	defaultMode="system"
	darkClassNames={['dark']}
	lightClassNames={['light']}
	themeColors={{ dark: '#000000', light: '#ffffff' }}
/>
{@render children()}
