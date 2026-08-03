<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarSubProps = MenubarPrimitive.SubProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: MenubarSubProps = $props();
</script>

<MenubarPrimitive.Sub bind:open {...restProps} />
