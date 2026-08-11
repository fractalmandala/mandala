<script lang="ts">
	import { highlightCode, plainCodeHtml, resolveLanguage } from '$lib/highlight/index.js';

	let {
		code,
		lang = 'svelte'
	}: {
		code: string;
		/** Language id or alias (svelte, ts, bash, …). */
		lang?: string;
	} = $props();

	const source = $derived(code.replace(/^\n+/, '').replace(/\n+$/, ''));
	const language = $derived(resolveLanguage(lang));

	let html = $state('');
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	// Re-highlight when code or language changes.
	$effect(() => {
		const c = source;
		const l = language;
		// Immediate plain fallback so layout doesn't jump empty.
		html = plainCodeHtml(c, l);
		let cancelled = false;
		highlightCode(c, { lang: l, hideLines: true }).then((h) => {
			if (!cancelled) html = h;
		});
		return () => {
			cancelled = true;
		};
	});

	async function copy() {
		await navigator.clipboard.writeText(source);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1400);
	}
</script>

<div class="doc-code" data-language={language}>
	<span class="doc-code-lang" aria-hidden="true">{language}</span>
	<button class="doc-code-copy" type="button" onclick={copy} aria-label="Copy code">
		{copied ? 'Copied' : 'Copy'}
	</button>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized in highlightCode -->
	<div class="doc-code-body">
		{@html html}
	</div>
</div>
