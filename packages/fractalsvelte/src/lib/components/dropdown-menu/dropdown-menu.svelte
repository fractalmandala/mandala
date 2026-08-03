<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuProps = DropdownMenuPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: DropdownMenuProps = $props();
</script>

<DropdownMenuPrimitive.Root bind:open {...restProps} />
