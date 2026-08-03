<script lang="ts" module>
	import { Select as SelectPrimitive } from 'bits-ui';

	export type SelectPortalProps = SelectPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: SelectPortalProps = $props();
</script>

<SelectPrimitive.Portal {...restProps} />
