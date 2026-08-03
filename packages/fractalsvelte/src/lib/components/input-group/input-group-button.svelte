<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Button } from '../button/index.js';

	export type InputGroupButtonSize = 'xs' | 'sm' | 'icon-xs' | 'icon-sm';

	export type InputGroupButtonProps = Omit<ComponentProps<typeof Button>, 'size' | 'href'> & {
		size?: InputGroupButtonSize;
	};
</script>

<script lang="ts">
	// Keep data-slot="button" (do not override) so button.sass skin applies.
	// Group-specific radius/size tweaks live under [data-slot=input-group] [data-slot=button].
	let {
		ref = $bindable(null),
		children,
		type = 'button',
		variant = 'ghost',
		size = 'xs',
		...restProps
	}: InputGroupButtonProps = $props();
</script>

<Button bind:ref {type} {variant} {size} {...restProps}>
	{@render children?.()}
</Button>
