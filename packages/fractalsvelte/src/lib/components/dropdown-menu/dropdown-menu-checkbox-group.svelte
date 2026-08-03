<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuCheckboxGroupProps = DropdownMenuPrimitive.CheckboxGroupProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable([]),
		...restProps
	}: DropdownMenuCheckboxGroupProps = $props();
</script>

<DropdownMenuPrimitive.CheckboxGroup
	bind:ref
	bind:value
	data-slot="dropdown-menu-checkbox-group"
	{...restProps}
/>
