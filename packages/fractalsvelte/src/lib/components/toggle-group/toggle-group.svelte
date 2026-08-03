<script lang="ts" module>
	import { getContext, setContext } from 'svelte';
	import type {
		TogglePressedIconTone,
		TogglePressedSurface,
		ToggleSize,
		ToggleVariant
	} from '$lib/components/toggle/index.js';
	import type { ToggleGroup as ToggleGroupPrimitiveTypes } from 'bits-ui';

	export type ToggleGroupSpacing = number;
	export type ToggleGroupOrientation = 'horizontal' | 'vertical';

	export interface ToggleGroupContext {
		variant: ToggleVariant;
		size: ToggleSize;
		spacing: ToggleGroupSpacing;
		orientation: ToggleGroupOrientation;
		pressedSurface: TogglePressedSurface;
		pressedIconTone: TogglePressedIconTone;
	}

	export type ToggleGroupProps = ToggleGroupPrimitiveTypes.RootProps & {
		variant?: ToggleVariant;
		size?: ToggleSize;
		spacing?: ToggleGroupSpacing;
		pressedSurface?: TogglePressedSurface;
		pressedIconTone?: TogglePressedIconTone;
	};

	const contextKey = 'toggleGroup';

	export function setToggleGroupCtx(props: ToggleGroupContext) {
		setContext(contextKey, props);
	}

	export function getToggleGroupCtx() {
		return getContext<ToggleGroupContext>(contextKey);
	}
</script>

<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		value = $bindable(),
		size = 'default',
		spacing = 0,
		orientation = 'horizontal',
		variant = 'default',
		pressedSurface = 'muted',
		pressedIconTone = 'default',
		...restProps
	}: ToggleGroupProps = $props();

	setToggleGroupCtx({
		get variant() {
			return variant;
		},
		get size() {
			return size;
		},
		get spacing() {
			return spacing;
		},
		get orientation() {
			return orientation;
		},
		get pressedSurface() {
			return pressedSurface;
		},
		get pressedIconTone() {
			return pressedIconTone;
		}
	});
</script>

<ToggleGroupPrimitive.Root
	bind:ref
	bind:value={value as never}
	{orientation}
	data-slot="toggle-group"
	data-variant={variant}
	data-size={size}
	data-spacing={spacing}
	data-horizontal={orientation === 'horizontal' || undefined}
	data-vertical={orientation === 'vertical' || undefined}
	style={`--toggle-group-gap: ${spacing * 0.25}rem`}
	{...restProps}
/>
