<script lang="ts" module>
	import { Dialog as DialogPrimitive } from 'bits-ui';

	export type DialogTriggerVariant = 'default' | 'outline' | 'secondary' | 'ghost';
	export type DialogTriggerSize = 'default' | 'sm' | 'lg';

	export type DialogTriggerProps = DialogPrimitive.TriggerProps & {
		variant?: DialogTriggerVariant;
		size?: DialogTriggerSize;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		type = 'button',
		variant = 'outline',
		size = 'default',
		...restProps
	}: DialogTriggerProps = $props();
</script>

<DialogPrimitive.Trigger
	bind:ref
	data-slot="dialog-trigger"
	data-variant={variant}
	data-size={size}
	{type}
	{...restProps}
/>
