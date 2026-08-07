<script lang="ts">
	// ai-elements/Actions
	// Ghost-button row of message actions (retry / copy / like / etc.).
	// Slots let the caller provide custom actions; built-in actions are
	// retry (calls onRetry) and copy (uses CopyButton).

	import CopyButton from './CopyButton.svelte';
	import type { Snippet } from 'svelte';

	let {
		onRetry,
		copyText,
		children,
	} = $props<{
		onRetry?: () => void;
		copyText?: string;
		children?: Snippet;
	}>();
</script>

<div class="ai-actions">
	{#if onRetry}
		<button
			type="button"
			class="ai-action-btn"
			onclick={onRetry}
			title="Retry"
			aria-label="Retry"
		>
			↻ Retry
		</button>
	{/if}
	{#if copyText !== undefined}
		<CopyButton text={copyText} label="Copy" title="Copy message" />
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>
