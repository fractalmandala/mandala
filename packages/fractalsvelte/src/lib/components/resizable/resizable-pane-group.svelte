<script lang="ts" module>
	import type { PaneGroup, PaneGroupProps } from 'paneforge';
	import type { Radius } from '$lib/types.js';

	export type ResizablePaneGroupProps = PaneGroupProps & {
		/** Component instance with getLayout / setLayout / getId (paneforge). */
		this?: PaneGroup;
		/** Draw a token border around the group. */
		bordered?: boolean;
		/** Corner radius. Omit to keep square edges. */
		radius?: Radius;
		/**
		 * CSS max-width for the group.
		 * Prefer this over `width` — paneforge sets `width: 100%` inline.
		 */
		maxWidth?: string;
		/**
		 * CSS min-height for the group.
		 * Prefer this over `height` — paneforge sets `height: 100%` inline, so
		 * min-height is the reliable way to give demos a floor size.
		 */
		minHeight?: string;
		/** CSS max-height for the group. */
		maxHeight?: string;
	};
</script>

<script lang="ts">
	import * as ResizablePrimitive from 'paneforge';

	let {
		ref = $bindable(null),
		this: paneGroup = $bindable(),
		bordered = false,
		radius,
		maxWidth,
		minHeight,
		maxHeight,
		style,
		...restProps
	}: ResizablePaneGroupProps = $props();

	// paneforge merges styles last and always writes height/width: 100%. Only
	// properties it does not set (max-width, min/max-height) survive — see ledger.
	const rootStyle = $derived(
		[
			maxWidth && `max-width:${maxWidth}`,
			minHeight && `min-height:${minHeight}`,
			maxHeight && `max-height:${maxHeight}`,
			style
		]
			.filter(Boolean)
			.join(';')
	);
</script>

<ResizablePrimitive.PaneGroup
	bind:ref
	bind:this={paneGroup}
	data-slot="resizable-pane-group"
	data-bordered={bordered || undefined}
	data-radius={radius}
	style={rootStyle || undefined}
	{...restProps}
/>
