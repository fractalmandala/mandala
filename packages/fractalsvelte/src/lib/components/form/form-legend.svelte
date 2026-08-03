<script lang="ts" module>
	import * as FormPrimitive from 'formsnap';
	import type { WithoutChild } from '$lib/utils.js';

	export type FormLegendProps = WithoutChild<FormPrimitive.LegendProps>;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: FormLegendProps = $props();
</script>

<FormPrimitive.Legend bind:ref data-slot="form-legend" {...restProps} />
