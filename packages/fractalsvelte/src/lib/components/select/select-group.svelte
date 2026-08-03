<script lang="ts" module>
	import { Select as SelectPrimitive } from 'bits-ui';

	export type SelectGroupProps = SelectPrimitive.GroupProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: SelectGroupProps = $props();
</script>

<SelectPrimitive.Group bind:ref data-slot="select-group" {...restProps} />
