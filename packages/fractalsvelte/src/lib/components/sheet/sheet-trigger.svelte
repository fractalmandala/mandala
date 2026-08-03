<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type SheetTriggerProps = SheetPrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: SheetTriggerProps = $props();
</script>

<SheetPrimitive.Trigger bind:ref data-slot="sheet-trigger" {...restProps}>
	{@render children?.()}
</SheetPrimitive.Trigger>
