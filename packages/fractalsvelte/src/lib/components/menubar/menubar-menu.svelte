<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarMenuProps = MenubarPrimitive.MenuProps;
</script>

<script lang="ts">
	let { ...restProps }: MenubarMenuProps = $props();
</script>

<MenubarPrimitive.Menu {...restProps} />
