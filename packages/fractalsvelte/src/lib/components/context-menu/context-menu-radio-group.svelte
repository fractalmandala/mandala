<script lang="ts" module>
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';

	export type ContextMenuRadioGroupProps = ContextMenuPrimitive.RadioGroupProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(''),
		...restProps
	}: ContextMenuRadioGroupProps = $props();
</script>

<ContextMenuPrimitive.RadioGroup
	bind:ref
	bind:value
	data-slot="context-menu-radio-group"
	{...restProps}
/>
