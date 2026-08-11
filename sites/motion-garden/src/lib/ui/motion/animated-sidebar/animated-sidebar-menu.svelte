<script lang="ts">
	import SharedLayoutBg from '$lib/ui/motion/shared-layout-bg/shared-layout-bg.svelte';
	import type { AnimatedSidebarMenuProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let { class: className, children }: AnimatedSidebarMenuProps = $props();
</script>

<SharedLayoutBg
	as="ul"
	inset={0}
	pillClassName="sidebar-menu-pill"
	pillContainerClassName="sidebar-menu-pill-wrap"
	data-slot="sidebar-menu"
	class={className}
>
	{@render children()}
</SharedLayoutBg>
