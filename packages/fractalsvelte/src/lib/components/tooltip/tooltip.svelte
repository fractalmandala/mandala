<script lang="ts" module>
	import { Tooltip as TooltipPrimitive } from 'bits-ui';

	export type TooltipProps<Payload = never> = TooltipPrimitive.RootProps<Payload>;
</script>

<script lang="ts" generics="Payload = never">
	let { open = $bindable(false), ...restProps }: TooltipProps<Payload> = $props();
</script>

<TooltipPrimitive.Root bind:open {...restProps} />
