<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type MenubarShortcutProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: MenubarShortcutProps = $props();
</script>

<span bind:this={ref} data-slot="menubar-shortcut" {...restProps}>
	{@render children?.()}
</span>
