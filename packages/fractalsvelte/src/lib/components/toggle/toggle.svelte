<script lang="ts" module>
	import type { Toggle as TogglePrimitiveTypes } from 'bits-ui';

	export type ToggleVariant = 'default' | 'outline';
	export type ToggleSize = 'default' | 'sm' | 'lg';
	export type TogglePressedSurface = 'muted' | 'transparent';
	export type TogglePressedIconTone = 'default' | 'primary' | 'accent' | 'destructive';

	export type ToggleProps = TogglePrimitiveTypes.RootProps & {
		variant?: ToggleVariant;
		size?: ToggleSize;
		/**
		 * Surface treatment while pressed. Use "transparent" for icon-colour toggles.
		 */
		pressedSurface?: TogglePressedSurface;
		/**
		 * Token-backed icon colour while pressed. Icons must use currentColor for stroke/fill.
		 */
		pressedIconTone?: TogglePressedIconTone;
	};
</script>

<script lang="ts">
	import { Toggle as TogglePrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		pressed = $bindable(false),
		variant = 'default',
		size = 'default',
		pressedSurface = 'muted',
		pressedIconTone = 'default',
		...restProps
	}: ToggleProps = $props();
</script>

<TogglePrimitive.Root
	bind:ref
	bind:pressed
	data-slot="toggle"
	data-variant={variant}
	data-size={size}
	data-pressed-surface={pressedSurface}
	data-pressed-icon-tone={pressedIconTone}
	{...restProps}
/>
