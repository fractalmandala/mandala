<script lang="ts">
	// ai-elements/Mermaid
	// Renders a Mermaid diagram from the supplied code. On parse error,
	// falls back to rendering the raw code in a Code block.

	import { onDestroy } from 'svelte';
	import { sanitizeHtml } from '$lib/sanitizeHtml';
	import Code from './Code.svelte';

	let {
		code = '',
	} = $props<{
		code?: string;
	}>();

	let svg = $state<string>('');
	let error = $state<string>('');
	let mermaid: typeof import('mermaid').default | null = null;
	let initialized = false;
	let counter = 0;
	let renderRequestId = 0;

	async function ensureMermaid() {
		if (mermaid) return mermaid;
		const mod = await import('mermaid');
		mermaid = mod.default;
		if (!initialized) {
			mermaid.initialize({
				startOnLoad: false,
				securityLevel: 'strict',
				theme: 'dark',
				themeVariables: {
					background: 'var(--background10)',
					primaryColor: 'var(--background30)',
					primaryTextColor: 'var(--text-primary)',
					primaryBorderColor: 'var(--theme-color)',
					lineColor: 'var(--theme-color-alt)',
					secondaryColor: 'var(--background20)',
					tertiaryColor: 'var(--background20)',
					fontFamily: 'inherit',
				},
			});
			initialized = true;
		}
		return mermaid;
	}

	$effect(() => {
		const requestId = ++renderRequestId;
		const source = code?.trim() ?? '';
		if (!source) {
			svg = '';
			error = '';
			return;
		}
		const id = `mermaid-${++counter}`;
		(async () => {
			try {
				const m = await ensureMermaid();
				const result = await m.render(id, source);
				if (requestId !== renderRequestId) return;
				// mermaid's 'strict' securityLevel already sanitizes, but the diagram
				// source itself can be attacker-influenced (chat/prompt injection) —
				// sanitize the rendered SVG again here as a second layer before {@html}.
				svg = sanitizeHtml.svg(result.svg);
				error = '';
			} catch (e) {
				if (requestId !== renderRequestId) return;
				svg = '';
				error = (e as Error)?.message ?? String(e);
			}
		})();
	});

	onDestroy(() => {
		// Mermaid has no global cleanup, but stale async renders must not mutate an
		// unmounted component or overwrite a newer source.
		renderRequestId += 1;
	});
</script>

<div class="ai-mermaid">
	{#if error}
		<!-- Fallback: render the raw code in a Code block on parse error -->
		<Code code={code} lang="mermaid" showCopy={true} />
		<div class="ai-mermaid-error" role="alert">Mermaid parse error: {error}</div>
	{:else if svg}
		<div class="ai-mermaid-svg-wrap">
			{@html svg}
		</div>
	{:else}
		<div class="ai-mermaid-loading">Rendering diagram…</div>
	{/if}
</div>
