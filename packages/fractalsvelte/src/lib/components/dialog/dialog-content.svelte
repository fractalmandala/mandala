<script lang="ts" module>
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import type { ComponentProps, Snippet } from 'svelte';
	import DialogOverlay from './dialog-overlay.svelte';
	import DialogPortal from './dialog-portal.svelte';

	export type DialogContentProps = WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		/** CSS max-width for the dialog panel. Omit to use the luma md default. */
		maxWidth?: string;
		/** Optional CSS min-width for wider application dialogs. */
		minWidth?: string;
		children: Snippet;
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
		showCloseButton?: boolean;
		closeIcon?: Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		maxWidth,
		minWidth,
		portalProps,
		children,
		showCloseButton = true,
		closeIcon,
		style,
		...restProps
	}: DialogContentProps = $props();

	const contentStyle = $derived(
		[
			style,
			maxWidth ? `--dialog-content-max-width: ${maxWidth}` : undefined,
			minWidth ? `--dialog-content-min-width: ${minWidth}` : undefined
		]
			.filter(Boolean)
			.join('; ') || undefined
	);
</script>

<DialogPortal {...portalProps}>
	<DialogOverlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		style={contentStyle}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<DialogPrimitive.Close
				data-slot="dialog-close"
				data-variant="ghost"
				data-size="icon-sm"
				data-position="content"
				type="button"
				aria-label="Close"
			>
				<span data-slot="dialog-close-icon" aria-hidden="true">
					{#if closeIcon}
						{@render closeIcon()}
					{:else}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					{/if}
				</span>
				<span data-slot="dialog-close-label">Close</span>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPortal>
