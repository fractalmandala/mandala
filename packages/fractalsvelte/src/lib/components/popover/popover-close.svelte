<script lang="ts" module>
	import { Popover as PopoverPrimitive } from 'bits-ui';

	export type PopoverCloseProps = PopoverPrimitive.CloseProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: PopoverCloseProps = $props();
</script>

<PopoverPrimitive.Close bind:ref data-slot="popover-close" {...restProps} />
