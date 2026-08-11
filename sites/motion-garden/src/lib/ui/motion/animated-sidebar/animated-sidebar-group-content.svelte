<script lang="ts">
	import type { AnimatedSidebarGroupContentProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let { class: className, children }: AnimatedSidebarGroupContentProps = $props();
</script>

<div data-slot="sidebar-group-content" class={className}>
	{#if children}
		{@render children()}
	{/if}
</div>
