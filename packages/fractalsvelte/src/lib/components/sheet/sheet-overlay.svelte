<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type SheetOverlayProps = SheetPrimitive.OverlayProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: SheetOverlayProps = $props();
</script>

<SheetPrimitive.Overlay
	bind:ref
	data-slot="sheet-overlay"
	{...restProps}
/>
