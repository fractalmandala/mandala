<script lang="ts" module>
	import * as FormPrimitive from 'formsnap';
	import type { FormPath } from 'sveltekit-superforms';
	import type { WithoutChild } from '$lib/utils.js';

	export type FormFieldsetProps<
		T extends Record<string, unknown>,
		U extends FormPath<T>
	> = WithoutChild<FormPrimitive.FieldsetProps<T, U>>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>, U extends FormPath<T>">
	let { ref = $bindable(null), form, name, ...restProps }: FormFieldsetProps<T, U> = $props();
</script>

<FormPrimitive.Fieldset bind:ref {form} {name} data-slot="form-fieldset" {...restProps} />
