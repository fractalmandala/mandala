<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type SheetProps = SheetPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), children, ...restProps }: SheetProps = $props();
</script>

<SheetPrimitive.Root bind:open {...restProps}>
	{@render children?.()}
</SheetPrimitive.Root>
