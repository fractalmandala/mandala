<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarProps = MenubarPrimitive.RootProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: MenubarProps = $props();
</script>

<MenubarPrimitive.Root bind:ref data-slot="menubar" {...restProps} />
