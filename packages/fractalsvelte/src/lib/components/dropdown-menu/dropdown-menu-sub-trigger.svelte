<script lang="ts" module>
	import type { WithoutChild } from '$lib/utils.js';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuSubTriggerProps =
		WithoutChild<DropdownMenuPrimitive.SubTriggerProps> & {
			inset?: boolean;
		};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		children,
		...restProps
	}: DropdownMenuSubTriggerProps = $props();
</script>

<DropdownMenuPrimitive.SubTrigger
	bind:ref
	data-slot="dropdown-menu-sub-trigger"
	data-inset={inset || undefined}
	{...restProps}
>
	{@render children?.()}
	<span data-slot="dropdown-menu-sub-trigger-icon" aria-hidden="true">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="m9 18 6-6-6-6" />
		</svg>
	</span>
</DropdownMenuPrimitive.SubTrigger>
