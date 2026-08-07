<script lang="ts">
	// Module-styled confirm dialog — replaces native confirm() in the browser module.
	//
	// Usage:
	//   import { showConfirm } from './BrowserConfirm.svelte';
	//   const ok = await showConfirm('Are you sure?');
	//
	// The dialog is rendered on-demand and destroyed after resolution.
	// Implements the §3.10 swap-cheap rule: controlled `open` prop, no lifecycle tricks.
	import { incrementOverlay, decrementOverlay } from '../state/overlayCoordinator.svelte';

	interface Props {
		message: string;
		onResolve: (value: boolean) => void;
	}

	let { message, onResolve }: Props = $props();

	let mounted = $state(true);

	function confirm() {
		decrementOverlay();
		onResolve(true);
		mounted = false;
	}

	function cancel() {
		decrementOverlay();
		onResolve(false);
		mounted = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') cancel();
		if (e.key === 'Enter') confirm();
	}

	// Track overlay state
	$effect(() => {
		incrementOverlay();
		return () => { /* decrement handled by actions */ };
	});
</script>

{#if mounted}
	<div
		class="browser-confirm-overlay"
		role="alertdialog"
		tabindex="-1"
		aria-modal="true"
		aria-label="Confirmation"
		onkeydown={handleKeydown}
	>
		<div class="browser-confirm-dialog">
			<p class="browser-confirm-message">{message}</p>
			<div class="browser-confirm-actions">
				<button class="btn-text" onclick={cancel}>Cancel</button>
				<button class="btn-app" onclick={confirm}>OK</button>
			</div>
		</div>
	</div>
{/if}
