<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuRadioGroupProps = DropdownMenuPrimitive.RadioGroupProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		...restProps
	}: DropdownMenuRadioGroupProps = $props();
</script>

<DropdownMenuPrimitive.RadioGroup
	bind:ref
	bind:value
	data-slot="dropdown-menu-radio-group"
	{...restProps}
/>
