<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import { Tabs as TabsPrimitive } from 'bits-ui';

	export type TabsListVariant = 'default' | 'line';

	export type TabsListProps = WithElementRef<TabsPrimitive.ListProps, HTMLDivElement> & {
		variant?: TabsListVariant;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		variant = 'default',
		children,
		...restProps
	}: TabsListProps = $props();
</script>

<TabsPrimitive.List bind:ref data-slot="tabs-list" data-variant={variant} {...restProps}>
	{@render children?.()}
</TabsPrimitive.List>
