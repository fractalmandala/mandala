<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import type { ButtonSize, ButtonVariant } from "../button/button.svelte";

	export type AlertDialogActionProps = AlertDialogPrimitive.ActionProps & {
		variant?: ButtonVariant;
		size?: ButtonSize;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		variant = "default",
		size = "default",
		...restProps
	}: AlertDialogActionProps = $props();
</script>

<AlertDialogPrimitive.Action
	bind:ref
	data-slot="alert-dialog-action"
	data-variant={variant}
	data-size={size}
	{...restProps}
/>
