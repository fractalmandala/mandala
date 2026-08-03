<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Tooltip from 'fractalsvelte/tooltip';

	type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

	let {
		label,
		shortcut,
		side = 'bottom',
		class: className = 'app-tooltip-area',
		children,
		...buttonProps
	}: {
		label: string;
		shortcut?: string;
		side?: TooltipSide;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger class={className} aria-label={label} {...buttonProps}>
		{@render children?.()}
	</Tooltip.Trigger>
	<Tooltip.Content {side} sideOffset={10} data-tooltip="action">
		<span>{label}</span>
		{#if shortcut}<kbd>{shortcut}</kbd>{/if}
	</Tooltip.Content>
</Tooltip.Root>
