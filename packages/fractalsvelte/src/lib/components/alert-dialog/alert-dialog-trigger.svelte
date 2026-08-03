<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import type { ButtonSize, ButtonVariant } from "../button/button.svelte";

	export type AlertDialogTriggerProps = AlertDialogPrimitive.TriggerProps & {
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
	}: AlertDialogTriggerProps = $props();
</script>

<AlertDialogPrimitive.Trigger
	bind:ref
	data-slot="alert-dialog-trigger"
	data-variant={variant}
	data-size={size}
	{...restProps}
/>
