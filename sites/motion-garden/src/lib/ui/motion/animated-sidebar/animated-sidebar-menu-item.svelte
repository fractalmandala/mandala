<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { SPRING_LAYOUT } from '$lib/ui/lib/ease.js';
	import SharedLayoutBgItem from '$lib/ui/motion/shared-layout-bg/shared-layout-bg-item.svelte';
	import type { AnimatedSidebarMenuItemProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let { class: className, children }: AnimatedSidebarMenuItemProps = $props();
</script>

<motion.li
	layout="position"
	transition={SPRING_LAYOUT}
	data-slot="sidebar-menu-item"
	class={className}
>
	<SharedLayoutBgItem>
		{#if children}
			{@render children()}
		{/if}
	</SharedLayoutBgItem>
</motion.li>
