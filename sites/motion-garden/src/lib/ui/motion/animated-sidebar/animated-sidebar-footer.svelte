<script lang="ts">
	import type { AnimatedSidebarFooterProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let { class: className, children }: AnimatedSidebarFooterProps = $props();
</script>

<div data-slot="sidebar-footer" class={className}>
	{#if children}
		{@render children()}
	{/if}
</div>
