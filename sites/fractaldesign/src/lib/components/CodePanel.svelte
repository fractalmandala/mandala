<script lang="ts">
	import { canvas } from '$lib/states/canvasstate.svelte';
	import { exportHtmlCss, exportHtmlSass, exportSvelte } from '$lib/utils/codegen';

	let mode = $state<'css' | 'sass' | 'svelte'>('css');
	let copied = $state(false);

	// Regenerates whenever the scene graph changes — the "live" part.
	const code = $derived.by(() => {
		if (mode === 'svelte') return exportSvelte(canvas.items);
		if (mode === 'sass') {
			const { html, sass } = exportHtmlSass(canvas.items);
			return `<!-- HTML -->\n${html}\n\n// SASS\n${sass}`;
		}
		const { html, css } = exportHtmlCss(canvas.items);
		return `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}`;
	});

	let copyTimer: ReturnType<typeof setTimeout> | null = null;
	function copy() {
		try {
			navigator.clipboard?.writeText(code);
		} catch {
			/* ignore */
		}
		copied = true;
		if (copyTimer) clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 1400);
	}
</script>

<div class="code-panel">
	<div class="code-panel-head">
		<div class="code-tabs">
			<button class="code-tab" class:active={mode === 'css'} onclick={() => (mode = 'css')}>CSS</button>
			<button class="code-tab" class:active={mode === 'sass'} onclick={() => (mode = 'sass')}>SASS</button>
			<button class="code-tab" class:active={mode === 'svelte'} onclick={() => (mode = 'svelte')}>Svelte</button>
		</div>
		<button class="code-copy" class:done={copied} onclick={copy}>
			{#if copied}
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
				Copied
			{:else}
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="9" y="9" width="13" height="13" rx="2"></rect>
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
				</svg>
				Copy
			{/if}
		</button>
	</div>
	<pre class="code-output"><code>{code}</code></pre>
	<div class="code-foot">Live export · updates as you design</div>
</div>
