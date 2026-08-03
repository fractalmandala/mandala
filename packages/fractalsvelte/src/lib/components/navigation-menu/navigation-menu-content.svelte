<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

	export type NavigationMenuContentLayout = 'default' | 'simple' | 'grid' | 'feature';
	export type NavigationMenuContentWidth = 'auto' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	export type NavigationMenuContentProps = NavigationMenuPrimitive.ContentProps & {
		layout?: NavigationMenuContentLayout;
		width?: NavigationMenuContentWidth;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		layout = 'default',
		width = 'auto',
		...restProps
	}: NavigationMenuContentProps = $props();
</script>

<NavigationMenuPrimitive.Content
	bind:ref
	data-slot="navigation-menu-content"
	data-layout={layout}
	data-width={width}
	{...restProps}
/>
