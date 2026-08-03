<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import * as DropdownMenu from '$lib/components/dropdown-menu/index.js';

	export type PromptInputActionMenuProps = ComponentProps<typeof DropdownMenu.Root>;
</script>

<script lang="ts">
	let {
		open = $bindable(false),
		children,
		...restProps
	}: PromptInputActionMenuProps = $props();
</script>

<DropdownMenu.Root bind:open {...restProps}>
	{@render children?.()}
</DropdownMenu.Root>
