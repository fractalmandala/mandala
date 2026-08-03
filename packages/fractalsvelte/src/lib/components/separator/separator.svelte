<script lang="ts" module>
	import { Separator as SeparatorPrimitive } from 'bits-ui';

	export type SeparatorProps = SeparatorPrimitive.RootProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		'data-slot': dataSlot = 'separator',
		...restProps
	}: SeparatorProps = $props();
</script>

<SeparatorPrimitive.Root bind:ref data-slot={dataSlot} {...restProps} />
