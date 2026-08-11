<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { SUBMENU_ITEM_VARIANTS } from './animated-sidebar.utils.js';
	import type { AnimatedSidebarMenuSubItemProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let { class: className, children }: AnimatedSidebarMenuSubItemProps = $props();
</script>

<motion.li
	variants={SUBMENU_ITEM_VARIANTS}
	data-slot="sidebar-menu-sub-item"
	class={className}
>
	{#if children}
		{@render children()}
	{/if}
</motion.li>
