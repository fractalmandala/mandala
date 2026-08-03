<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';

	export type ContextMenuSubContentProps = ContextMenuPrimitive.SubContentProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: ContextMenuSubContentProps = $props();
</script>

<ContextMenuPrimitive.SubContent bind:ref data-slot="context-menu-sub-content" {...restProps} />
