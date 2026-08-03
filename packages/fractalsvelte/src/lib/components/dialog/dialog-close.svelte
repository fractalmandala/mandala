<script lang="ts" module>
	import { Dialog as DialogPrimitive } from 'bits-ui';

	export type DialogCloseVariant = 'default' | 'outline' | 'secondary' | 'ghost';
	export type DialogCloseSize = 'default' | 'sm' | 'icon-sm';
	export type DialogClosePosition = 'inline' | 'content';

	export type DialogCloseProps = DialogPrimitive.CloseProps & {
		variant?: DialogCloseVariant;
		size?: DialogCloseSize;
		position?: DialogClosePosition;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		type = 'button',
		variant = 'outline',
		size = 'default',
		position = 'inline',
		...restProps
	}: DialogCloseProps = $props();
</script>

<DialogPrimitive.Close
	bind:ref
	data-slot="dialog-close"
	data-variant={variant}
	data-size={size}
	data-position={position}
	{type}
	{...restProps}
/>
