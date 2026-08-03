<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	export type InputProps = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
	>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		files = $bindable(),
		type,
		// The source lets a caller rename the slot so a wrapper (InputGroup) can restyle the
		// input. Since data-slot IS our styling hook, overriding it deliberately opts out of
		// [data-slot='input'] — which is exactly the intent. Kept.
		"data-slot": dataSlot = "input",
		...restProps
	}: InputProps = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input bind:this={ref} data-slot={dataSlot} {type} bind:value {...restProps} />
{/if}
