<script lang="ts">
	import { getContextMenuRadioGroupContext } from './context-menu-context.js';
	import ContextMenuItemBase from './context-menu-item-base.svelte';
	import type { ContextMenuRadioItemProps } from './context-menu.types.js';
	import './context-menu.sass';

	let { children, value, ...rest }: ContextMenuRadioItemProps = $props();

	const group = getContextMenuRadioGroupContext('ContextMenuRadioItem');
	const checked = $derived(group.value === value);
</script>

<ContextMenuItemBase
	{...rest}
	role="menuitemradio"
	ariaChecked={checked}
	onSelect={() => group.onValueChange?.(value)}
>
	<span data-slot="context-menu-icon">
		<span data-slot="context-menu-radio-dot" data-checked={checked ? 'true' : undefined}></span>
	</span>
	{@render children()}
</ContextMenuItemBase>
