<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import { Tabs as TabsPrimitive } from 'bits-ui';

	export type TabsContentProps = WithElementRef<TabsPrimitive.ContentProps, HTMLDivElement>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: TabsContentProps = $props();
</script>

<TabsPrimitive.Content bind:ref data-slot="tabs-content" {...restProps}>
	{@render children?.()}
</TabsPrimitive.Content>
