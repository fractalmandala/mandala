<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		index,
		label,
		title,
		accent = '',
		lede = '',
		children
	}: {
		index: string;
		label: string;
		title: string;
		accent?: string;
		lede?: string;
		children?: Snippet;
	} = $props();
</script>

<section class="site-section site-container box gap24">
	<p class="eyebrow">{index} / {label}</p>
	<div class="box gap12">
		<h2 class="display-md">
			{title}
			{#if accent}<span class="accent-word">{accent}</span>{/if}
		</h2>
		{#if lede}
			<p class="lede">{lede}</p>
		{/if}
	</div>
	{#if children}
		{@render children()}
	{/if}
</section>
