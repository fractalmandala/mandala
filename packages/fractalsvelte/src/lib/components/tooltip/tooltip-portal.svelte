<script lang="ts" module>
	import { Tooltip as TooltipPrimitive } from 'bits-ui';

	export type TooltipPortalProps = TooltipPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: TooltipPortalProps = $props();
</script>

<TooltipPrimitive.Portal {...restProps} />
