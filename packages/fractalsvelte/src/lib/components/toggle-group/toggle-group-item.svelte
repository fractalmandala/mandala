<script lang="ts" module>
	import type {
		TogglePressedIconTone,
		TogglePressedSurface,
		ToggleSize,
		ToggleVariant
	} from '$lib/components/toggle/index.js';
	import type { ToggleGroup as ToggleGroupPrimitiveTypes } from 'bits-ui';

	export type ToggleGroupItemProps = ToggleGroupPrimitiveTypes.ItemProps & {
		variant?: ToggleVariant;
		size?: ToggleSize;
		pressedSurface?: TogglePressedSurface;
		pressedIconTone?: TogglePressedIconTone;
	};
</script>

<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
	import { getToggleGroupCtx } from './toggle-group.svelte';

	let {
		ref = $bindable(null),
		value,
		size,
		variant,
		pressedSurface,
		pressedIconTone,
		...restProps
	}: ToggleGroupItemProps = $props();

	const ctx = getToggleGroupCtx();
	const resolvedVariant = $derived(variant ?? ctx?.variant ?? 'default');
	const resolvedSize = $derived(size ?? ctx?.size ?? 'default');
	const resolvedSpacing = $derived(ctx?.spacing ?? 0);
	const resolvedPressedSurface = $derived(pressedSurface ?? ctx?.pressedSurface ?? 'muted');
	const resolvedPressedIconTone = $derived(pressedIconTone ?? ctx?.pressedIconTone ?? 'default');
</script>

<ToggleGroupPrimitive.Item
	bind:ref
	data-slot="toggle-group-item"
	data-variant={resolvedVariant}
	data-size={resolvedSize}
	data-spacing={resolvedSpacing}
	data-pressed-surface={resolvedPressedSurface}
	data-pressed-icon-tone={resolvedPressedIconTone}
	{value}
	{...restProps}
/>
