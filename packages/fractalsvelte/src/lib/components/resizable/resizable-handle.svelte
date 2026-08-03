<script lang="ts" module>
	import type { PaneResizerProps } from 'paneforge';
	import type { WithoutChildrenOrChild } from '$lib/utils.js';

	export type ResizableHandleProps = WithoutChildrenOrChild<PaneResizerProps> & {
		/** Show the grip pill on the handle. */
		withHandle?: boolean;
	};
</script>

<script lang="ts">
	import * as ResizablePrimitive from 'paneforge';

	let {
		ref = $bindable(null),
		withHandle = false,
		...restProps
	}: ResizableHandleProps = $props();
</script>

<ResizablePrimitive.PaneResizer bind:ref data-slot="resizable-handle" {...restProps}>
	{#if withHandle}
		<div data-slot="resizable-handle-icon"></div>
	{/if}
</ResizablePrimitive.PaneResizer>
