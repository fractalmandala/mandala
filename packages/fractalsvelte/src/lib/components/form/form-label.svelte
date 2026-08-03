<script lang="ts" module>
	import * as FormPrimitive from 'formsnap';
	import type { WithoutChild } from '$lib/utils.js';

	export type FormLabelProps = WithoutChild<FormPrimitive.LabelProps>;
</script>

<script lang="ts">
	import { Label } from '$lib/components/label/index.js';

	let { ref = $bindable(null), children, ...restProps }: FormLabelProps = $props();
</script>

<FormPrimitive.Label bind:ref {...restProps}>
	{#snippet child({ props })}
		<Label {...props} data-slot="form-label">
			{@render children?.()}
		</Label>
	{/snippet}
</FormPrimitive.Label>
