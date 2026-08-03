<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarGroupProps = MenubarPrimitive.GroupProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: MenubarGroupProps = $props();
</script>

<MenubarPrimitive.Group bind:ref data-slot="menubar-group" {...restProps} />
