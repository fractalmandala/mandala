<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type SheetPortalProps = SheetPrimitive.PortalProps;
</script>

<script lang="ts">
	let { children, ...restProps }: SheetPortalProps = $props();
</script>

<SheetPrimitive.Portal {...restProps}>
	{@render children?.()}
</SheetPrimitive.Portal>
