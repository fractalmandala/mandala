<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	export type AlertDialogOverlayProps = AlertDialogPrimitive.OverlayProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: AlertDialogOverlayProps = $props();
</script>

<AlertDialogPrimitive.Overlay
	bind:ref
	data-slot="alert-dialog-overlay"
	{...restProps}
/>
