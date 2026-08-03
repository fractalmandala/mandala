<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuPortalProps = DropdownMenuPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: DropdownMenuPortalProps = $props();
</script>

<DropdownMenuPrimitive.Portal {...restProps} />
