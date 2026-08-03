<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	export type AlertDialogDescriptionProps = AlertDialogPrimitive.DescriptionProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: AlertDialogDescriptionProps = $props();
</script>

<AlertDialogPrimitive.Description
	bind:ref
	data-slot="alert-dialog-description"
	{...restProps}
/>
