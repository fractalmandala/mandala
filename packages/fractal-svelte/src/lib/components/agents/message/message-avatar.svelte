<script lang="ts">
	import type { Snippet } from 'svelte';
	let { placeholder = false, children }: { placeholder?: boolean; children?: Snippet } = $props();
</script>

<div
	data-slot="message-avatar"
	data-placeholder={placeholder || undefined}
	aria-hidden={placeholder || undefined}
>
	{@render children?.()}
</div>
