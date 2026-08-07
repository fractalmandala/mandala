<script lang="ts">
	import { storageKey, type DocsColorScheme } from './theme-script.js';

	let { label = 'Colour scheme' }: { label?: string } = $props();

	let scheme = $state<DocsColorScheme>('system');

	$effect(() => {
		const stored = localStorage.getItem(storageKey);
		scheme = stored === 'light' || stored === 'dark' ? stored : 'system';
	});

	function apply(next: DocsColorScheme) {
		scheme = next;
		if (next === 'system') {
			localStorage.removeItem(storageKey);
			document.documentElement.removeAttribute('data-theme');
			return;
		}

		localStorage.setItem(storageKey, next);
		document.documentElement.setAttribute('data-theme', next);
	}
</script>

<div class="docs-theme-toggle" role="group" aria-label={label}>
	{#each ['light', 'dark', 'system'] as const as option (option)}
		<button
			type="button"
			class="docs-button"
			aria-pressed={scheme === option}
			onclick={() => apply(option)}
		>
			{option}
		</button>
	{/each}
</div>
