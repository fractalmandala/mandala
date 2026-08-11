<script lang="ts">
	import type { AnimatedSidebarHeaderProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let { class: className, children }: AnimatedSidebarHeaderProps = $props();
</script>

<div data-slot="sidebar-header" class={className}>
	{#if children}
		{@render children()}
	{/if}
</div>
