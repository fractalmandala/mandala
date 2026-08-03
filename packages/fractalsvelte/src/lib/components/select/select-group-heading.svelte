<script lang="ts" module>
	import { Select as SelectPrimitive } from 'bits-ui';

	export type SelectGroupHeadingProps = SelectPrimitive.GroupHeadingProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: SelectGroupHeadingProps = $props();
</script>

<SelectPrimitive.GroupHeading bind:ref data-slot="select-group-heading" {...restProps} />
