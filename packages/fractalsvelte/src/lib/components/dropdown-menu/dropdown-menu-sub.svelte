<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuSubProps = DropdownMenuPrimitive.SubProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: DropdownMenuSubProps = $props();
</script>

<DropdownMenuPrimitive.Sub bind:open {...restProps} />
