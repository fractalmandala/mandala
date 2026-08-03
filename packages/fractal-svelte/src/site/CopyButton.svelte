<script lang="ts">
	let { text, label = 'Copy' }: { text: string; label?: string } = $props();
	let feedback = $state('');

	async function copy() {
		try {
			if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
			else {
				const area = document.createElement('textarea');
				area.value = text;
				area.setAttribute('readonly', '');
				area.style.position = 'fixed';
				area.style.opacity = '0';
				document.body.append(area);
				area.select();
				document.execCommand('copy');
				area.remove();
			}
			feedback = 'Copied';
		} catch {
			feedback = 'Copy failed';
		}
		setTimeout(() => (feedback = ''), 1800);
	}
</script>

<button class="copy-button" type="button" onclick={copy} aria-label="{label} to clipboard">{feedback || label}</button>
<span class="sr-only" aria-live="polite">{feedback}</span>
