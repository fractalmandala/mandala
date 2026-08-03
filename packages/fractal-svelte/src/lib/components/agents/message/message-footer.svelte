<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getMessageContext } from './context.js';
	let { children }: { children?: Snippet } = $props();
	const from = getMessageContext();
</script>

<div data-slot="message-footer" data-from={from}>{@render children?.()}</div>
