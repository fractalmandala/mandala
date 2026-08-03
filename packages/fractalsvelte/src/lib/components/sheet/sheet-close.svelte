<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type SheetCloseProps = SheetPrimitive.CloseProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: SheetCloseProps = $props();
</script>

<SheetPrimitive.Close bind:ref data-slot="sheet-close" {...restProps}>
	{@render children?.()}
</SheetPrimitive.Close>
