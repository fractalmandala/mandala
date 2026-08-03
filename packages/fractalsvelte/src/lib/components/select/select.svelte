<script lang="ts" module>
	import { Select as SelectPrimitive } from 'bits-ui';

	export type SelectProps = SelectPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), value = $bindable(), ...restProps }: SelectProps = $props();
</script>

<SelectPrimitive.Root bind:open bind:value={value as never} {...restProps} />
