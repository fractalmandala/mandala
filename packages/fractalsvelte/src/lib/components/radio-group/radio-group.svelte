<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';

	export type RadioGroupProps = WithElementRef<RadioGroupPrimitive.RootProps, HTMLDivElement>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(''),
		children,
		...restProps
	}: RadioGroupProps = $props();
</script>

<RadioGroupPrimitive.Root bind:ref bind:value data-slot="radio-group" {...restProps}>
	{@render children?.()}
</RadioGroupPrimitive.Root>
