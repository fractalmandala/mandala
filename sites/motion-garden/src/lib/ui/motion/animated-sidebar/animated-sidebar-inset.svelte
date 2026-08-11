<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import type { AnimatedSidebarInsetProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let { class: className, children }: AnimatedSidebarInsetProps = $props();
</script>

<motion.main data-slot="sidebar-inset" class={className}>
	{#if children}
		{@render children()}
	{/if}
</motion.main>
