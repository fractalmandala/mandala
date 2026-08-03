<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import * as DropdownMenu from '$lib/components/dropdown-menu/index.js';

	export type PromptInputActionMenuContentProps = ComponentProps<typeof DropdownMenu.Content>;
</script>

<script lang="ts">
	let {
		align = 'start',
		children,
		...restProps
	}: PromptInputActionMenuContentProps = $props();
</script>

<DropdownMenu.Content {align} data-prompt-input-action-menu="true" {...restProps}>
	{@render children?.()}
</DropdownMenu.Content>
