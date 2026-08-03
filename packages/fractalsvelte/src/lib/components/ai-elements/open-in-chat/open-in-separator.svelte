<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DropdownMenuSeparator } from "$lib/components/dropdown-menu/index.js";

	export type OpenInSeparatorProps = ComponentProps<typeof DropdownMenuSeparator>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		...restProps
	}: OpenInSeparatorProps = $props();
</script>

<DropdownMenuSeparator
	bind:ref
	data-slot="open-in-separator"
	{...restProps}
/>
