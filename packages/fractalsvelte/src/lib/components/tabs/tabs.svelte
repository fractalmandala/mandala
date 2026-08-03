<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import { Tabs as TabsPrimitive } from 'bits-ui';

	export type TabsProps = WithElementRef<TabsPrimitive.RootProps, HTMLDivElement>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(''),
		children,
		...restProps
	}: TabsProps = $props();
</script>

<TabsPrimitive.Root bind:ref bind:value data-slot="tabs" {...restProps}>
	{@render children?.()}
</TabsPrimitive.Root>
