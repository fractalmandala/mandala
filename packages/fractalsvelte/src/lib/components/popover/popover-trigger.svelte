<script lang="ts" module>
	import { Popover as PopoverPrimitive } from 'bits-ui';

	export type PopoverTriggerProps = PopoverPrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: PopoverTriggerProps = $props();
</script>

<PopoverPrimitive.Trigger bind:ref data-slot="popover-trigger" {...restProps} />
