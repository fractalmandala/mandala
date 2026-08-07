<script lang="ts">
	/**
	 * Wires the copy buttons the Markdown pipeline renders.
	 * It is the only client behaviour a documentation page needs, and it degrades to a
	 * plain code block when JavaScript is unavailable.
	 */
	let copyLabel = $state('Copy');

	$effect(() => {
		const onclick = async (event: Event) => {
			const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-docs-copy]');
			const code = button?.closest('.docs-code')?.querySelector('code');
			if (!button || !code) {
				return;
			}

			try {
				await navigator.clipboard.writeText(code.textContent ?? '');
				const previous = button.textContent;
				button.textContent = 'Copied';
				setTimeout(() => (button.textContent = previous ?? copyLabel), 2000);
			} catch {
				button.textContent = 'Press ⌘C';
			}
		};

		document.addEventListener('click', onclick);
		return () => document.removeEventListener('click', onclick);
	});
</script>
