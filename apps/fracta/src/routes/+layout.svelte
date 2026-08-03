<script lang="ts">
	import "$lib/styles/index.sass";
	import "../app.css";
	import type { Snippet } from "svelte";
	import {  iW } from '$lib/state/globalstores';
	import { prefs } from '$lib/state/prefs.svelte';
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();
	let width = $state(0);
	let isMobile = $derived(width < 1201);
	$effect(() => {
		$iW = isMobile;
	});
	$effect(() => {
		if (typeof document === 'undefined') return;
		if (prefs.theme === 'system') delete document.documentElement.dataset.theme;
		else document.documentElement.dataset.theme = prefs.theme;
	});

</script>

<svelte:window bind:innerWidth={width}/>

	{#if children}
		{@render children()}
	{/if}
