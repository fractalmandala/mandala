<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuSeparatorProps = DropdownMenuPrimitive.SeparatorProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: DropdownMenuSeparatorProps = $props();
</script>

<DropdownMenuPrimitive.Separator bind:ref data-slot="dropdown-menu-separator" {...restProps} />
