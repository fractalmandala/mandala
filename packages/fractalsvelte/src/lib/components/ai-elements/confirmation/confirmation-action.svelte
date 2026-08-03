<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Button } from "$lib/components/button/index.js";

	export type ConfirmationActionProps = ComponentProps<typeof Button>;
</script>

<script lang="ts">
	let {
		variant = "default",
		size = "sm",
		children,
		ref = $bindable(null),
		...restProps
	}: ConfirmationActionProps = $props();
</script>

<Button
	bind:ref
	type="button"
	{variant}
	{size}
	{...restProps}
	data-confirmation-action="true"
>
	{@render children?.()}
</Button>
