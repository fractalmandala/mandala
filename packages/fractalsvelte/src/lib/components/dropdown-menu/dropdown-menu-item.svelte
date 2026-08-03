<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuItemVariant = 'default' | 'destructive';
	export type DropdownMenuItemProps = DropdownMenuPrimitive.ItemProps & {
		inset?: boolean;
		variant?: DropdownMenuItemVariant;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		variant = 'default',
		...restProps
	}: DropdownMenuItemProps = $props();
</script>

<DropdownMenuPrimitive.Item
	bind:ref
	data-slot="dropdown-menu-item"
	data-inset={inset || undefined}
	data-variant={variant}
	{...restProps}
/>
