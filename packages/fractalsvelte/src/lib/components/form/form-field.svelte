<script lang="ts" module>
	import * as FormPrimitive from 'formsnap';
	import type { FormPath } from 'sveltekit-superforms';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef, WithoutChildren } from '$lib/utils.js';

	export type FormFieldProps<
		T extends Record<string, unknown>,
		U extends FormPath<T>
	> = FormPrimitive.FieldProps<T, U> &
		WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>, U extends FormPath<T>">
	let {
		ref = $bindable(null),
		form,
		name,
		children: childrenProp,
		...restProps
	}: FormFieldProps<T, U> = $props();
</script>

<FormPrimitive.Field {form} {name}>
	{#snippet children({ constraints, errors, tainted, value })}
		<div bind:this={ref} data-slot="form-item" {...restProps}>
			{@render childrenProp?.({ constraints, errors, tainted, value: value as T[U] })}
		</div>
	{/snippet}
</FormPrimitive.Field>
