<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

	export type NavigationMenuProps = NavigationMenuPrimitive.RootProps & {
		/** Renders the viewport part after the menu children. */
		viewport?: boolean;
	};
</script>

<script lang="ts">
	import NavigationMenuViewport from './navigation-menu-viewport.svelte';

	let {
		ref = $bindable(null),
		value = $bindable(''),
		viewport = true,
		children,
		...restProps
	}: NavigationMenuProps = $props();
</script>

<NavigationMenuPrimitive.Root
	bind:ref
	bind:value
	data-slot="navigation-menu"
	data-viewport={viewport}
	{...restProps}
>
	{@render children?.()}
	{#if viewport}
		<NavigationMenuViewport />
	{/if}
</NavigationMenuPrimitive.Root>
