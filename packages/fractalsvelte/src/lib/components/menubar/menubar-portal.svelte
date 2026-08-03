<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarPortalProps = MenubarPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: MenubarPortalProps = $props();
</script>

<MenubarPrimitive.Portal {...restProps} />
