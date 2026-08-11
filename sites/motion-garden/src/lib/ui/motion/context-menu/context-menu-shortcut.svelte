<script lang="ts">
	import type { Snippet } from 'svelte';
	import './context-menu.sass';

	let {
		children,
		class: className
	}: {
		children: Snippet;
		class?: string;
	} = $props();
</script>

<span aria-hidden="true" data-slot="context-menu-shortcut" class={className}>
	{@render children()}
</span>
