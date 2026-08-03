<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type SheetDescriptionProps = SheetPrimitive.DescriptionProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: SheetDescriptionProps = $props();
</script>

<SheetPrimitive.Description bind:ref data-slot="sheet-description" {...restProps}>
	{@render children?.()}
</SheetPrimitive.Description>
