<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DropdownMenuItem } from "$lib/components/dropdown-menu/index.js";

	export type OpenInItemProps = ComponentProps<typeof DropdownMenuItem>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: OpenInItemProps = $props();
</script>

<DropdownMenuItem
	bind:ref
	data-slot="open-in-item"
	{...restProps}
>
	{@render children?.()}
</DropdownMenuItem>
