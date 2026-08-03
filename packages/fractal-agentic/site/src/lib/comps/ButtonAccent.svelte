<script lang="ts">
	import AccentButton from './AccentButton.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		children?: Snippet;
	}

	let { label = 'Button', type = 'button', disabled = false, children }: Props = $props();
</script>

<AccentButton {label} {type} {disabled}>
	{#if children}
		{@render children()}
	{:else}
		{label}
	{/if}
</AccentButton>
