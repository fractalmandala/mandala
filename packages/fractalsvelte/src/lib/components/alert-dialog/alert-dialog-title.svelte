<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	export type AlertDialogTitleProps = AlertDialogPrimitive.TitleProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: AlertDialogTitleProps = $props();
</script>

<AlertDialogPrimitive.Title
	bind:ref
	data-slot="alert-dialog-title"
	{...restProps}
/>
