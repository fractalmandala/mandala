<script lang="ts" module>
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import type { ComponentProps, Snippet } from 'svelte';
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import SheetPortal from './sheet-portal.svelte';
	import SheetOverlay from './sheet-overlay.svelte';

	export type SheetSide = 'top' | 'right' | 'bottom' | 'left';

	export type SheetContentProps = WithoutChildrenOrChild<SheetPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SheetPortal>>;
		side?: SheetSide;
		showCloseButton?: boolean;
		closeIcon?: Snippet;
		children: Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		side = 'right',
		showCloseButton = true,
		closeIcon,
		portalProps,
		children,
		...restProps
	}: SheetContentProps = $props();
</script>

<SheetPortal {...portalProps}>
	<SheetOverlay />
	<SheetPrimitive.Content bind:ref data-slot="sheet-content" data-side={side} {...restProps}>
		{@render children?.()}
		{#if showCloseButton}
			<!-- Styled as a full control under data-slot=sheet-close (not a Button that steals the slot). -->
			<SheetPrimitive.Close
				data-slot="sheet-close"
				data-variant="ghost"
				data-size="icon-sm"
				type="button"
				aria-label="Close"
			>
				<span data-slot="sheet-close-icon" aria-hidden="true">
					{#if closeIcon}
						{@render closeIcon()}
					{:else}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					{/if}
				</span>
				<span data-slot="sheet-close-label">Close</span>
			</SheetPrimitive.Close>
		{/if}
	</SheetPrimitive.Content>
</SheetPortal>
