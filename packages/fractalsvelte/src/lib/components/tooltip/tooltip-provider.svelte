<script lang="ts" module>
	import { Tooltip as TooltipPrimitive } from 'bits-ui';

	export type TooltipProviderProps = TooltipPrimitive.ProviderProps;
</script>

<script lang="ts">
	let { delayDuration = 0, children, ...restProps }: TooltipProviderProps = $props();
</script>

<TooltipPrimitive.Provider {delayDuration} {...restProps}>
	{@render children?.()}
</TooltipPrimitive.Provider>
