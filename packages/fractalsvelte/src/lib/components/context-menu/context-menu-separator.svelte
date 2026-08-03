<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';

	export type ContextMenuSeparatorProps = ContextMenuPrimitive.SeparatorProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: ContextMenuSeparatorProps = $props();
</script>

<ContextMenuPrimitive.Separator bind:ref data-slot="context-menu-separator" {...restProps} />
