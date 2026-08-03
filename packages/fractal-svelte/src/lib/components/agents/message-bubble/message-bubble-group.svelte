<script lang="ts">
	import type { Snippet } from 'svelte';
	let { spacing = 'compact', children }: { spacing?: 'compact' | 'default'; children?: Snippet } =
		$props();
</script>

<div data-slot="message-bubble-group" data-spacing={spacing}>{@render children?.()}</div>
