<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';

	export type ContextMenuProps = ContextMenuPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: ContextMenuProps = $props();
</script>

<ContextMenuPrimitive.Root bind:open {...restProps} />
