<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	export type AlertDialogProps = AlertDialogPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: AlertDialogProps = $props();
</script>

<AlertDialogPrimitive.Root bind:open {...restProps} />
