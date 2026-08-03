<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type DropdownMenuShortcutProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: DropdownMenuShortcutProps = $props();
</script>

<span bind:this={ref} data-slot="dropdown-menu-shortcut" {...restProps}>
	{@render children?.()}
</span>
