<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ContextMenuShortcutProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: ContextMenuShortcutProps = $props();
</script>

<span bind:this={ref} data-slot="context-menu-shortcut" {...restProps}>
	{@render children?.()}
</span>
