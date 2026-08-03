<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';

	export type ContextMenuPortalProps = ContextMenuPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: ContextMenuPortalProps = $props();
</script>

<ContextMenuPrimitive.Portal {...restProps} />
