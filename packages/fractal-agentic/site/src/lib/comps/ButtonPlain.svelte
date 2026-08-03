<script lang="ts">
	import PlainButton from './PlainButton.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		children?: Snippet;
	}

	let { label = 'Button', type = 'button', disabled = false, children }: Props = $props();
</script>

<PlainButton {label} {type} {disabled}>
	{#if children}
		{@render children()}
	{:else}
		{label}
	{/if}
</PlainButton>
