<script lang="ts">
	import DropdownMenu, { type DropdownItem } from './DropdownMenu.svelte';

	/**
	 * Right-click context menu — positions the shared DropdownMenu at cursor
	 * coordinates via an invisible virtual anchor. Used by the file tree,
	 * sidebar empty space, and editor tabs.
	 */

	type Props = {
		open?: boolean;
		x?: number;
		y?: number;
		items?: DropdownItem[];
		ariaLabel?: string;
	};

	let { open = $bindable(false), x = 0, y = 0, items = [], ariaLabel = 'Context menu' }: Props = $props();

	let virtualAnchor = $state<HTMLElement | null>(null);
</script>

{#if open}
	<span
		bind:this={virtualAnchor}
		class="context-menu-anchor"
		style={`position: fixed; left: ${x}px; top: ${y}px; width: 0; height: 0; pointer-events: none;`}
		aria-hidden="true"
	></span>
{/if}

<DropdownMenu bind:open anchor={virtualAnchor} placement="bottom-start" {items} {ariaLabel} />
