<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/button/index.js';

	export type SuggestionProps = Omit<ComponentProps<typeof Button>, 'onclick' | 'href'> & {
		/** Text shown on the chip and passed to `onSelect` when clicked. */
		suggestion?: string;
		/** Fired with the suggestion string when the chip is activated. */
		onSelect?: (suggestion: string) => void;
	};
</script>

<script lang="ts">
	let {
		suggestion,
		onSelect,
		variant = 'outline',
		size = 'sm',
		children,
		ref = $bindable(null),
		...restProps
	}: SuggestionProps = $props();

	function handleClick() {
		if (suggestion !== undefined) {
			onSelect?.(suggestion);
		}
	}
</script>

<!-- Keep data-slot=button so button.sass skin applies; chrome via data-suggestion. -->
<Button
	bind:ref
	{size}
	type="button"
	{variant}
	onclick={handleClick}
	data-suggestion="true"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{suggestion}
	{/if}
</Button>
