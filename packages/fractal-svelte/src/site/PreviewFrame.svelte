<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children, planned = false }: { children?: Snippet; planned?: boolean } = $props();
</script>

<div class="preview-frame" data-planned={planned}>{#if children}{@render children()}{/if}</div>
