<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type FieldErrorItem = { message?: string };

	export type FieldErrorProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
		errors?: FieldErrorItem[];
	};
</script>

<script lang="ts">
	let { ref = $bindable(null), children, errors, ...restProps }: FieldErrorProps = $props();

	const hasContent = $derived.by(() => {
		if (children) return true;
		if (!errors || errors.length === 0) return false;
		if (errors.length === 1 && !errors[0]?.message) return false;
		return true;
	});

	const isMultipleErrors = $derived(errors && errors.length > 1);
	const singleErrorMessage = $derived(errors && errors.length === 1 && errors[0]?.message);
</script>

{#if hasContent}
	<div bind:this={ref} role="alert" data-slot="field-error" {...restProps}>
		{#if children}
			{@render children()}
		{:else if singleErrorMessage}
			{singleErrorMessage}
		{:else if isMultipleErrors}
			<ul data-slot="field-error-list">
				{#each errors ?? [] as error, index (index)}
					{#if error?.message}
						<li data-slot="field-error-item">{error.message}</li>
					{/if}
				{/each}
			</ul>
		{/if}
	</div>
{/if}
