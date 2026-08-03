<script lang="ts" module>
	import * as FormPrimitive from 'formsnap';
	import type { WithoutChild } from '$lib/utils.js';

	export type FormDescriptionProps = WithoutChild<FormPrimitive.DescriptionProps>;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: FormDescriptionProps = $props();
</script>

<FormPrimitive.Description bind:ref data-slot="form-description" {...restProps} />
