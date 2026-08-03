<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarSeparatorProps = MenubarPrimitive.SeparatorProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: MenubarSeparatorProps = $props();
</script>

<MenubarPrimitive.Separator bind:ref data-slot="menubar-separator" {...restProps} />
