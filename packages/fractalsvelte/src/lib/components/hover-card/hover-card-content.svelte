<script lang="ts" module>
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import { LinkPreview as HoverCardPrimitive } from 'bits-ui';
	import type { ComponentProps } from 'svelte';
	import HoverCardPortal from './hover-card-portal.svelte';

	export type HoverCardContentProps = HoverCardPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof HoverCardPortal>>;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		align = 'center',
		sideOffset = 4,
		portalProps,
		...restProps
	}: HoverCardContentProps = $props();
</script>

<HoverCardPortal {...portalProps}>
	<HoverCardPrimitive.Content
		bind:ref
		data-slot="hover-card-content"
		{align}
		{sideOffset}
		{...restProps}
	/>
</HoverCardPortal>
