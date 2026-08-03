<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import { Tabs as TabsPrimitive } from 'bits-ui';

	export type TabsTriggerProps = WithElementRef<TabsPrimitive.TriggerProps, HTMLButtonElement>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: TabsTriggerProps = $props();
</script>

<TabsPrimitive.Trigger bind:ref data-slot="tabs-trigger" {...restProps}>
	{@render children?.()}
</TabsPrimitive.Trigger>
