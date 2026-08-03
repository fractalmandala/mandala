<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuGroupProps = DropdownMenuPrimitive.GroupProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: DropdownMenuGroupProps = $props();
</script>

<DropdownMenuPrimitive.Group bind:ref data-slot="dropdown-menu-group" {...restProps} />
