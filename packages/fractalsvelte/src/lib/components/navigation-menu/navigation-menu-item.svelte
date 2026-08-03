<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

	export type NavigationMenuItemProps = NavigationMenuPrimitive.ItemProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: NavigationMenuItemProps = $props();
</script>

<NavigationMenuPrimitive.Item bind:ref data-slot="navigation-menu-item" {...restProps} />
