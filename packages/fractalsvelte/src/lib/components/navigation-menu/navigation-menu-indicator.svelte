<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

	export type NavigationMenuIndicatorProps = NavigationMenuPrimitive.IndicatorProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: NavigationMenuIndicatorProps = $props();
</script>

<NavigationMenuPrimitive.Indicator bind:ref data-slot="navigation-menu-indicator" {...restProps}>
	{#if children}
		{@render children()}
	{:else}
		<div data-slot="navigation-menu-indicator-arrow"></div>
	{/if}
</NavigationMenuPrimitive.Indicator>
