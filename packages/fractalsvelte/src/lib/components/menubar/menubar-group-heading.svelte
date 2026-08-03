<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	export type MenubarGroupHeadingProps = MenubarPrimitive.GroupHeadingProps & {
		inset?: boolean;
	};
</script>

<script lang="ts">
	let { ref = $bindable(null), inset = false, ...restProps }: MenubarGroupHeadingProps = $props();
</script>

<MenubarPrimitive.GroupHeading
	bind:ref
	data-slot="menubar-group-heading"
	data-inset={inset || undefined}
	{...restProps}
/>
