<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type CommandShortcutProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: CommandShortcutProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="command-shortcut"
	{...restProps}
>
	{@render children?.()}
</span>
