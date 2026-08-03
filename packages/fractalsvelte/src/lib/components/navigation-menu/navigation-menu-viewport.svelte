<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

	export type NavigationMenuViewportProps = NavigationMenuPrimitive.ViewportProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: NavigationMenuViewportProps = $props();
</script>

<div data-slot="navigation-menu-viewport-wrapper">
	<NavigationMenuPrimitive.Viewport
		bind:ref
		data-slot="navigation-menu-viewport"
		{...restProps}
	/>
</div>
