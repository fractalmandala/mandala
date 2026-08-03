<script lang="ts" module>
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
	import type { ComponentProps } from 'svelte';
	import ContextMenuPortal from './context-menu-portal.svelte';

	export type ContextMenuContentProps = ContextMenuPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof ContextMenuPortal>>;
	};
</script>

<script lang="ts">
	let { ref = $bindable(null), portalProps, ...restProps }: ContextMenuContentProps = $props();
</script>

<ContextMenuPortal {...portalProps}>
	<ContextMenuPrimitive.Content bind:ref data-slot="context-menu-content" {...restProps} />
</ContextMenuPortal>
