<script lang="ts" module>
	import * as FormPrimitive from 'formsnap';
	import type { FormPathLeaves } from 'sveltekit-superforms';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef, WithoutChildren } from '$lib/utils.js';

	export type FormElementFieldProps<
		T extends Record<string, unknown>,
		U extends FormPathLeaves<T>
	> = WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> &
		FormPrimitive.ElementFieldProps<T, U>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>, U extends FormPathLeaves<T>">
	let {
		ref = $bindable(null),
		form,
		name,
		children: childrenProp,
		...restProps
	}: FormElementFieldProps<T, U> = $props();
</script>

<FormPrimitive.ElementField {form} {name}>
	{#snippet children({ constraints, errors, tainted, value })}
		<div bind:this={ref} data-slot="form-item" {...restProps}>
			{@render childrenProp?.({ constraints, errors, tainted, value: value as T[U] })}
		</div>
	{/snippet}
</FormPrimitive.ElementField>
