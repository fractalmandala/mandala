<script lang="ts" module>
	import { PinInput as InputOTPPrimitive } from "bits-ui";

	export type InputOTPProps = InputOTPPrimitive.RootProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(""),
		...restProps
	}: InputOTPProps = $props();
</script>

<InputOTPPrimitive.Root
	bind:ref
	bind:value
	data-slot="input-otp"
	spellcheck={false}
	{...restProps}
/>
