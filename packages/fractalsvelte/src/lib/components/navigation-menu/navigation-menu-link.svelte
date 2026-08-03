<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

	export type NavigationMenuLinkVariant = 'default' | 'trigger' | 'panel' | 'hero';
	export type NavigationMenuLinkProps = NavigationMenuPrimitive.LinkProps & {
		variant?: NavigationMenuLinkVariant;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		variant = 'default',
		...restProps
	}: NavigationMenuLinkProps = $props();
</script>

<NavigationMenuPrimitive.Link
	bind:ref
	data-slot="navigation-menu-link"
	data-variant={variant}
	{...restProps}
/>
