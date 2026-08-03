<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DropdownMenuContent } from "$lib/components/dropdown-menu/index.js";

	export type OpenInContentProps = ComponentProps<typeof DropdownMenuContent>;
</script>

<script lang="ts">
	let {
		children,
		align = "start",
		ref = $bindable(null),
		...restProps
	}: OpenInContentProps = $props();
</script>

<DropdownMenuContent
	bind:ref
	{align}
	data-slot="open-in-content"
	{...restProps}
>
	{@render children?.()}
</DropdownMenuContent>
