<script lang="ts" module>
	import { Popover as PopoverPrimitive } from 'bits-ui';

	export type PopoverPortalProps = PopoverPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: PopoverPortalProps = $props();
</script>

<PopoverPrimitive.Portal {...restProps} />
