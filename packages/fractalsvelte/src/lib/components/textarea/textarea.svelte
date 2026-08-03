<script lang="ts" module>
	import type { WithElementRef, WithoutChildren } from "$lib/utils.js";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	export type TextareaProps = WithoutChildren<WithElementRef<HTMLTextareaAttributes>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		// Overridable so a wrapper can opt the field out of the default textarea styling.
		"data-slot": dataSlot = "textarea",
		...restProps
	}: TextareaProps = $props();
</script>

<textarea bind:this={ref} data-slot={dataSlot} bind:value {...restProps}></textarea>
