<script lang="ts" module>
	import { Tooltip as TooltipPrimitive } from 'bits-ui';

	export type TooltipTriggerVariant = 'default' | 'outline' | 'ghost';

	export type TooltipTriggerProps<Payload = never> = TooltipPrimitive.TriggerProps<Payload> & {
		/** Visual style for the default button trigger. */
		variant?: TooltipTriggerVariant;
	};
</script>

<script lang="ts" generics="Payload = never">
	let {
		ref = $bindable(null),
		variant = 'outline',
		children,
		...restProps
	}: TooltipTriggerProps<Payload> = $props();
</script>

<TooltipPrimitive.Trigger
	bind:ref
	data-slot="tooltip-trigger"
	data-variant={variant}
	{...restProps}
>
	{@render children?.()}
</TooltipPrimitive.Trigger>
