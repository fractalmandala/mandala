<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Textarea } from "../textarea/index.js";

	export type InputGroupTextareaProps = ComponentProps<typeof Textarea>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(""),
		...restProps
	}: InputGroupTextareaProps = $props();
</script>

<Textarea
	bind:ref
	bind:value
	data-slot="input-group-control"
	{...restProps}
/>
