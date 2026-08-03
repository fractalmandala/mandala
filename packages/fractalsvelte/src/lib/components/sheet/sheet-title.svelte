<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type SheetTitleProps = SheetPrimitive.TitleProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: SheetTitleProps = $props();
</script>

<SheetPrimitive.Title bind:ref data-slot="sheet-title" {...restProps}>
	{@render children?.()}
</SheetPrimitive.Title>
