<script lang="ts">
	import type { AnimatedSidebarContentProps } from './animated-sidebar.types.js';
	import './animated-sidebar.sass';

	let { class: className, children }: AnimatedSidebarContentProps = $props();
</script>

<div data-slot="sidebar-content" class={className}>
	{#if children}
		{@render children()}
	{/if}
</div>
