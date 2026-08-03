<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';

	export type ContextMenuTriggerProps = ContextMenuPrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: ContextMenuTriggerProps = $props();
</script>

<ContextMenuPrimitive.Trigger bind:ref data-slot="context-menu-trigger" {...restProps} />
