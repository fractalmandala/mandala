<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { AlertDescription } from "$lib/components/alert/index.js";

	export type ConfirmationTitleProps = ComponentProps<typeof AlertDescription>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ConfirmationTitleProps = $props();
</script>

<AlertDescription
	bind:ref
	data-slot="confirmation-title"
	{...restProps}
>
	{@render children?.()}
</AlertDescription>
