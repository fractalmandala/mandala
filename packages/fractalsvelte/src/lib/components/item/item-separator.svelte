<script lang="ts" module>
	import type { SeparatorProps } from '$lib/components/separator/index.js';

	export type ItemSeparatorProps = SeparatorProps;
</script>

<script lang="ts">
	import { Separator } from '$lib/components/separator/index.js';

	let {
		ref = $bindable(null),
		'data-slot': dataSlot = 'item-separator',
		orientation = 'horizontal',
		...restProps
	}: ItemSeparatorProps = $props();
</script>

<Separator bind:ref data-slot={dataSlot} {orientation} {...restProps} />
