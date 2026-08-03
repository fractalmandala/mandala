<script lang="ts" module>
	import type { WithoutChild } from '$lib/utils.js';
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';

	export type ContextMenuSubTriggerProps = WithoutChild<ContextMenuPrimitive.SubTriggerProps> & {
		inset?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		children,
		...restProps
	}: ContextMenuSubTriggerProps = $props();
</script>

<ContextMenuPrimitive.SubTrigger
	bind:ref
	data-slot="context-menu-sub-trigger"
	data-inset={inset || undefined}
	{...restProps}
>
	{@render children?.()}
	<span data-slot="context-menu-sub-trigger-icon" aria-hidden="true">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="m9 18 6-6-6-6" />
		</svg>
	</span>
</ContextMenuPrimitive.SubTrigger>
