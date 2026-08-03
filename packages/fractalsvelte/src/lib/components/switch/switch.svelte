<script lang="ts" module>
	import type { WithElementRef, WithoutChildrenOrChild } from '$lib/utils.js';
	import { Switch as SwitchPrimitive } from 'bits-ui';

	export type SwitchSize = 'sm' | 'default';

	export type SwitchProps = WithElementRef<
		WithoutChildrenOrChild<SwitchPrimitive.RootProps>,
		HTMLButtonElement
	> & {
		size?: SwitchSize;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		checked = $bindable(false),
		size = 'default',
		...restProps
	}: SwitchProps = $props();
</script>

<SwitchPrimitive.Root bind:ref bind:checked data-slot="switch" data-size={size} {...restProps}>
	<SwitchPrimitive.Thumb data-slot="switch-thumb" />
</SwitchPrimitive.Root>
