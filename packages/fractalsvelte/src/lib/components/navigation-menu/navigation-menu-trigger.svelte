<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type NavigationMenuTriggerVariant = 'default' | 'muted';
	export type NavigationMenuTriggerProps = NavigationMenuPrimitive.TriggerProps & {
		variant?: NavigationMenuTriggerVariant;
		/** Replaces the default chevron. Set to false to hide the icon. */
		icon?: Snippet | false;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		variant = 'default',
		icon,
		children,
		...restProps
	}: NavigationMenuTriggerProps = $props();
</script>

<NavigationMenuPrimitive.Trigger
	bind:ref
	data-slot="navigation-menu-trigger"
	data-variant={variant}
	{...restProps}
>
	{@render children?.()}
	{#if icon !== false}
		<span data-slot="navigation-menu-trigger-icon" aria-hidden="true">
			{#if icon}
				{@render icon()}
			{:else}
				<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
					<path d="m5 8 5 5 5-5" />
				</svg>
			{/if}
		</span>
	{/if}
</NavigationMenuPrimitive.Trigger>
