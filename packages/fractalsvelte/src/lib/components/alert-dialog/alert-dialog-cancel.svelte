<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import type { ButtonSize, ButtonVariant } from "../button/button.svelte";

	export type AlertDialogCancelProps = AlertDialogPrimitive.CancelProps & {
		variant?: ButtonVariant;
		size?: ButtonSize;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		variant = "outline",
		size = "default",
		...restProps
	}: AlertDialogCancelProps = $props();
</script>

<AlertDialogPrimitive.Cancel
	bind:ref
	data-slot="alert-dialog-cancel"
	data-variant={variant}
	data-size={size}
	{...restProps}
/>
