<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Input } from "../input/index.js";

	export type InputGroupInputProps = ComponentProps<typeof Input>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(""),
		...restProps
	}: InputGroupInputProps = $props();
</script>

<Input
	bind:ref
	bind:value
	data-slot="input-group-control"
	{...restProps}
/>
