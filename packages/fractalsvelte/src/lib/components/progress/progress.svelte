<script lang="ts" module>
	import type { WithElementRef, WithoutChildrenOrChild } from '$lib/utils.js';
	import { Progress as ProgressPrimitive } from 'bits-ui';

	export type ProgressProps = WithElementRef<
		WithoutChildrenOrChild<ProgressPrimitive.RootProps>,
		HTMLDivElement
	> & {
		/** CSS width for the root, replacing documented width utility usage. */
		width?: string;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = 0,
		max = 100,
		min = 0,
		width,
		style,
		...restProps
	}: ProgressProps = $props();

	const percentage = $derived(
		value === null
			? 0
			: Math.min(100, Math.max(0, (((value ?? min) - min) / ((max ?? 100) - min || 1)) * 100))
	);

	const rootStyle = $derived([width && `width:${width}`, style].filter(Boolean).join(';'));
</script>

<ProgressPrimitive.Root
	bind:ref
	data-slot="progress"
	{value}
	{max}
	{min}
	style={rootStyle || undefined}
	{...restProps}
>
	<div
		data-slot="progress-indicator"
		style={`transform: translateX(-${100 - percentage}%)`}
	></div>
</ProgressPrimitive.Root>
