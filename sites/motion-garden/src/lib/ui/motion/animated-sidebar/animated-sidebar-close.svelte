<script lang="ts">
	import { useAnimatedSidebar } from './animated-sidebar.context.js';
	import type { AnimatedSidebarCloseProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let {
		'aria-label': ariaLabel = 'Close sidebar',
		type = 'button',
		onclick,
		class: className,
		children
	}: AnimatedSidebarCloseProps = $props();

	const ctx = useAnimatedSidebar();

	function handleClick(event: MouseEvent) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		if (ctx.isMobile) ctx.setOpenMobile(false);
		else ctx.setOpen(false);
	}
</script>

<button
	type={type}
	aria-label={ariaLabel}
	onclick={handleClick}
	data-slot="sidebar-close"
	class={className}
>
	{@render children()}
</button>
