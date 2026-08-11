<script lang="ts">
	import { AnimatePresence, motion } from '@humanspeak/svelte-motion';
	import SharedLayoutBgItem from '$lib/ui/motion/shared-layout-bg/shared-layout-bg-item.svelte';
	import { SUBMENU_VARIANTS } from './animated-sidebar.utils.js';
	import { useAnimatedSidebar, useAnimatedSidebarPanel } from './animated-sidebar.context.js';
	import type { AnimatedSidebarMenuSubProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let { open, class: className, children }: AnimatedSidebarMenuSubProps = $props();

	const ctx = useAnimatedSidebar();
	const panel = useAnimatedSidebarPanel();
</script>

<AnimatePresence initial={false} mode="popLayout">
	{#if open && !panel.collapsed}
		<motion.ul
			key="sidebar-submenu"
			variants={ctx.reduce ? undefined : SUBMENU_VARIANTS}
			initial={ctx.reduce ? false : 'closed'}
			animate={ctx.reduce ? { opacity: 1 } : 'open'}
			exit={ctx.reduce ? { opacity: 0 } : 'closed'}
			transition={ctx.reduce ? { duration: 0.12 } : undefined}
			data-slot="sidebar-menu-sub"
			class={className}
		>
			<SharedLayoutBgItem>
				{#if children}
					{@render children()}
				{/if}
			</SharedLayoutBgItem>
		</motion.ul>
	{/if}
</AnimatePresence>
