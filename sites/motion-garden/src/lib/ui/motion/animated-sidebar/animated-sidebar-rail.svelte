<script lang="ts">
	import { useAnimatedSidebar, useAnimatedSidebarPanel } from './animated-sidebar.context.js';
	import type { AnimatedSidebarRailProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let {
		'aria-label': ariaLabel = 'Toggle sidebar',
		type = 'button',
		onclick,
		class: className,
		children
	}: AnimatedSidebarRailProps = $props();

	const ctx = useAnimatedSidebar();
	const panel = useAnimatedSidebarPanel();

	function handleClick(event: MouseEvent) {
		onclick?.(event);
		if (!event.defaultPrevented) ctx.toggleSidebar();
	}
</script>

<button
	type={type}
	data-side={panel.side}
	aria-label={ariaLabel}
	title="Toggle sidebar"
	tabindex={-1}
	onclick={handleClick}
	data-slot="sidebar-rail"
	class={className}
>
	{#if children}
		{@render children()}
	{/if}
</button>
