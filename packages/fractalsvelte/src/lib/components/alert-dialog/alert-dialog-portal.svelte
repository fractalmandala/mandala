<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	export type AlertDialogPortalProps = AlertDialogPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: AlertDialogPortalProps = $props();
</script>

<AlertDialogPrimitive.Portal {...restProps} />
