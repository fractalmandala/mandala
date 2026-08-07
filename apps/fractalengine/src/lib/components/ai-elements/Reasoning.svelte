<script lang="ts">
	// ai-elements/Reasoning
	// Collapsible section for chain-of-thought / reasoning text.
	// Auto-opens while streaming; auto-closes shortly after streaming ends.

	import { onDestroy } from 'svelte';

	let {
		text = '',
		isStreaming = false,
		autoOpenMs = 1500,
	} = $props<{
		text?: string;
		isStreaming?: boolean;
		autoOpenMs?: number;
	}>();

	let isOpen = $state(false);
	let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (isStreaming) {
			isOpen = true;
			if (autoCloseTimer) {
				clearTimeout(autoCloseTimer);
				autoCloseTimer = null;
			}
		} else if (text) {
			if (autoCloseTimer) clearTimeout(autoCloseTimer);
			autoCloseTimer = setTimeout(() => {
				isOpen = false;
			}, autoOpenMs);
		}
		return () => {
			// cleanup
		};
	});

	onDestroy(() => {
		if (autoCloseTimer) clearTimeout(autoCloseTimer);
	});

	function toggle() {
		isOpen = !isOpen;
	}
</script>

{#if text}
	<div class="ai-reasoning" class:is-open={isOpen} class:is-streaming={isStreaming}>
		<button
			type="button"
			class="ai-reasoning-header"
			onclick={toggle}
			aria-expanded={isOpen}
		>
			<img
				src="/iconset/{isOpen ? 'chevronDown' : 'chevronRight'}.svg"
				alt=""
				class="ai-reasoning-chevron"
			/>
			<span class="ai-reasoning-label">
				{isStreaming ? 'Reasoning…' : 'Reasoning'}
			</span>
		</button>
		{#if isOpen}
			<div class="ai-reasoning-body">
				<span class="text-sm">{text}</span>
			</div>
		{/if}
	</div>
{/if}
