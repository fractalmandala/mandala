<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		count = 2,
		minWidth = '14rem',
		children
	}: {
		/** Preferred column count. Columns collapse below `minWidth`. */
		count?: number;
		/** Narrowest a column may become before the grid reflows. */
		minWidth?: string;
		children: Snippet;
	} = $props();
</script>

<div
	class="docs-columns"
	style="--docs-columns-count: {count}; --docs-columns-min: {minWidth};"
>
	{@render children()}
</div>
