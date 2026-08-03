<script lang="ts" module>
	import * as FormPrimitive from 'formsnap';
	import type { WithoutChild } from '$lib/utils.js';

	export type FormFieldErrorsProps = WithoutChild<FormPrimitive.FieldErrorsProps>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children: childrenProp,
		...restProps
	}: FormFieldErrorsProps = $props();
</script>

<FormPrimitive.FieldErrors bind:ref data-slot="form-field-errors" {...restProps}>
	{#snippet children({ errors, errorProps })}
		{#if childrenProp}
			{@render childrenProp({ errors, errorProps })}
		{:else}
			{#each errors as error (error)}
				<div data-slot="form-field-error" {...errorProps}>{error}</div>
			{/each}
		{/if}
	{/snippet}
</FormPrimitive.FieldErrors>
