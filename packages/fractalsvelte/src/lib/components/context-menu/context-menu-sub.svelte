<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';

	export type ContextMenuSubProps = ContextMenuPrimitive.SubProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: ContextMenuSubProps = $props();
</script>

<ContextMenuPrimitive.Sub bind:open {...restProps} />
