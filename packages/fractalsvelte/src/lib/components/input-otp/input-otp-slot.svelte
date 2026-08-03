<script lang="ts" module>
	import { PinInput as InputOTPPrimitive } from "bits-ui";

	export type InputOTPSlotProps = InputOTPPrimitive.CellProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		cell,
		...restProps
	}: InputOTPSlotProps = $props();
</script>

<InputOTPPrimitive.Cell
	{cell}
	bind:ref
	data-slot="input-otp-slot"
	{...restProps}
>
	{cell.char}
	{#if cell.hasFakeCaret}
		<div data-slot="input-otp-caret">
			<div data-slot="input-otp-caret-line"></div>
		</div>
	{/if}
</InputOTPPrimitive.Cell>
