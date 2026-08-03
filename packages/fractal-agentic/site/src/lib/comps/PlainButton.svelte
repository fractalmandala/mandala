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

<button {type} {disabled} class="plain">
	{#if children}
		{@render children()}
	{:else}
		{label}
	{/if}
</button>

<style>
	.plain {
		min-height: 24px;
		padding: 3px 16px;
		border: 1px solid #636363;
		border-radius: 3px;
		color: #000000;
		background: #ffffff;
		font-family: Geist, 'Google Sans Flex', system-ui, sans-serif;
		font-size: 15px;
		line-height: 16px;
		cursor: pointer;
	}
	.plain:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
</style>
