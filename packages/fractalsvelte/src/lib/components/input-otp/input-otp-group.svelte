<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type InputOTPGroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: InputOTPGroupProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="input-otp-group"
	{...restProps}
>
	{@render children?.()}
</div>
