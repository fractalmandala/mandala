<script lang="ts">
	import type { Snippet } from 'svelte';
	import "virtual:fractals-styler.css";
	import "$lib/styles/index.sass";
	import { Toaster, toast } from "fractalsvelte/sonner"

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
 <title>Shradhapp</title>
</svelte:head>

<Toaster />
{@render children()}
