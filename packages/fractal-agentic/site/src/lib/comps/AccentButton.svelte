<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		children?: Snippet;
	}

	let { label = 'Button', type = 'button', disabled = false, children }: Props = $props();
</script>

<button {type} {disabled} class="accent">
	{#if children}
		{@render children()}
	{:else}
		{label}
	{/if}
</button>

<style>
	.accent {
		min-height: 24px;
		padding: 4px 12px;
		border: 0;
		border-radius: 5px;
		color: #ffffff;
		background: var(--shell-accent);
		font-family: Geist, 'Google Sans Flex', system-ui, sans-serif;
		font-size: 15px;
		line-height: 16px;
		cursor: pointer;
	}
	.accent:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
</style>
