<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarItemVariant = 'default' | 'destructive';
	export type MenubarItemProps = MenubarPrimitive.ItemProps & {
		inset?: boolean;
		variant?: MenubarItemVariant;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		variant = 'default',
		...restProps
	}: MenubarItemProps = $props();
</script>

<MenubarPrimitive.Item
	bind:ref
	data-slot="menubar-item"
	data-inset={inset || undefined}
	data-variant={variant}
	{...restProps}
/>
