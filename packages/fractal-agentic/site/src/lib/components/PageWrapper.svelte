<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		mainArea?: Snippet;
		asideArea?: Snippet;
	}

	let { mainArea, asideArea }: Props = $props();
</script>

<div class="content-area">
	<div class="content-main">
		{#if mainArea}
			{@render mainArea()}
		{/if}
	</div>
	<aside class="content-meta">
		{#if asideArea}
			{@render asideArea()}
		{/if}
	</aside>
</div>
