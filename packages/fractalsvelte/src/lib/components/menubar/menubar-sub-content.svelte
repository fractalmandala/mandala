<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarSubContentProps = MenubarPrimitive.SubContentProps & {
		width?: string;
	};
</script>

<script lang="ts">
	let { ref = $bindable(null), width, style, ...restProps }: MenubarSubContentProps = $props();

	const widthStyle = $derived(width ? `width: ${width}` : undefined);
	const mergedStyle = $derived([widthStyle, style].filter(Boolean).join('; ') || undefined);
</script>

<MenubarPrimitive.SubContent
	bind:ref
	data-slot="menubar-sub-content"
	style={mergedStyle}
	{...restProps}
/>
