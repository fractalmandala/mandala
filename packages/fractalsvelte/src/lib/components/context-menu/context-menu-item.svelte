<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';

	export type ContextMenuItemVariant = 'default' | 'destructive';
	export type ContextMenuItemProps = ContextMenuPrimitive.ItemProps & {
		inset?: boolean;
		variant?: ContextMenuItemVariant;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		variant = 'default',
		...restProps
	}: ContextMenuItemProps = $props();
</script>

<ContextMenuPrimitive.Item
	bind:ref
	data-slot="context-menu-item"
	data-inset={inset || undefined}
	data-variant={variant}
	{...restProps}
/>
