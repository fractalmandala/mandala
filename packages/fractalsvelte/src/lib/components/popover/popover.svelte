<script lang="ts" module>
	import { Popover as PopoverPrimitive } from 'bits-ui';

	export type PopoverProps = PopoverPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: PopoverProps = $props();
</script>

<PopoverPrimitive.Root bind:open {...restProps} />
