<script lang="ts" module>
	import type { WithoutChild } from '$lib/utils.js';
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarSubTriggerProps = WithoutChild<MenubarPrimitive.SubTriggerProps> & {
		inset?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		children,
		...restProps
	}: MenubarSubTriggerProps = $props();
</script>

<MenubarPrimitive.SubTrigger
	bind:ref
	data-slot="menubar-sub-trigger"
	data-inset={inset || undefined}
	{...restProps}
>
	{@render children?.()}
	<span data-slot="menubar-sub-trigger-icon" aria-hidden="true">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="m9 18 6-6-6-6" />
		</svg>
	</span>
</MenubarPrimitive.SubTrigger>
