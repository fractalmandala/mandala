<script lang="ts">
	// ai-elements/CopyButton
	// Lightweight ghost button that copies the given text via navigator.clipboard.
	// Shows "Copied!" briefly on success.

	let {
		text = '',
		label = 'Copy',
		title,
	} = $props<{
		text?: string;
		label?: string;
		title?: string;
	}>();

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | null = null;

	async function copy() {
		try {
			await navigator.clipboard.writeText(text ?? '');
			copied = true;
			if (resetTimer) clearTimeout(resetTimer);
			resetTimer = setTimeout(() => {
				copied = false;
			}, 1500);
		} catch (e) {
			console.error('Copy failed:', e);
		}
	}

	import { onDestroy } from 'svelte';
	onDestroy(() => {
		if (resetTimer) clearTimeout(resetTimer);
	});
</script>

<button
	type="button"
	class="ai-copy-btn"
	class:is-copied={copied}
	onclick={copy}
	title={title ?? label}
	aria-label={label}
>
	{copied ? 'Copied!' : label}
</button>
