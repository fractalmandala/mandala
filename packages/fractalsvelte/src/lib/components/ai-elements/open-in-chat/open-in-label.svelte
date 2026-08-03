<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DropdownMenuLabel } from "$lib/components/dropdown-menu/index.js";

	export type OpenInLabelProps = ComponentProps<typeof DropdownMenuLabel>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: OpenInLabelProps = $props();
</script>

<DropdownMenuLabel
	bind:ref
	data-slot="open-in-label"
	{...restProps}
>
	{@render children?.()}
</DropdownMenuLabel>
