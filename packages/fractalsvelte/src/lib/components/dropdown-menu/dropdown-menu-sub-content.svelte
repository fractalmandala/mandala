<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuSubContentProps = DropdownMenuPrimitive.SubContentProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: DropdownMenuSubContentProps = $props();
</script>

<DropdownMenuPrimitive.SubContent bind:ref data-slot="dropdown-menu-sub-content" {...restProps} />
