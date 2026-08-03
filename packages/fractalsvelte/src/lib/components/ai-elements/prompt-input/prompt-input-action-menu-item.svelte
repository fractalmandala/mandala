<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import * as DropdownMenu from '$lib/components/dropdown-menu/index.js';

	export type PromptInputActionMenuItemProps = ComponentProps<typeof DropdownMenu.Item>;
</script>

<script lang="ts">
	let { children, ...restProps }: PromptInputActionMenuItemProps = $props();
</script>

<DropdownMenu.Item data-prompt-input-action-item="true" {...restProps}>
	{@render children?.()}
</DropdownMenu.Item>
