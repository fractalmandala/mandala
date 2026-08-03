<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarTriggerProps = MenubarPrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: MenubarTriggerProps = $props();
</script>

<MenubarPrimitive.Trigger bind:ref data-slot="menubar-trigger" {...restProps} />
