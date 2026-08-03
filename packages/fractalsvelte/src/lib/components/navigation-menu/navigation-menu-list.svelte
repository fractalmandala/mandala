<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

	export type NavigationMenuListWrap = 'nowrap' | 'wrap';
	export type NavigationMenuListProps = NavigationMenuPrimitive.ListProps & {
		wrap?: NavigationMenuListWrap;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		wrap = 'nowrap',
		...restProps
	}: NavigationMenuListProps = $props();
</script>

<NavigationMenuPrimitive.List
	bind:ref
	data-slot="navigation-menu-list"
	data-wrap={wrap}
	{...restProps}
/>
