<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import { Label as LabelPrimitive } from 'bits-ui';

	export type LabelProps = WithElementRef<LabelPrimitive.RootProps, HTMLLabelElement>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: LabelProps = $props();
</script>

<LabelPrimitive.Root bind:ref data-slot="label" {...restProps}>
	{@render children?.()}
</LabelPrimitive.Root>
