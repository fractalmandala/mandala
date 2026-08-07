<script lang="ts">
	// ai-elements/Response
	// Renders markdown content via `marked`. Code fences marked ```mermaid
	// are routed to the Mermaid component; other fences to the Code component.

	import { marked } from 'marked';
	import { sanitizeHtml } from '$lib/sanitizeHtml';
	import Code from './Code.svelte';
	import Mermaid from './Mermaid.svelte';

	let {
		content = '',
		isStreaming = false,
	} = $props<{
		content?: string;
		isStreaming?: boolean;
	}>();

	interface Block {
		type: 'html' | 'code';
		lang?: string;
		html?: string;
		code?: string;
	}

	// LLM output rendered here can contain attacker-influenced markup (prompt injection,
	// a poisoned response) — sanitize before it ever reaches {@html}. Only safe image/link
	// schemes are allowed; javascript:/data: (except inline images) and all event handlers
	// are stripped.

	// Parse content into a sequence of blocks:
	//   { type: 'html', html: string }      — normal markdown rendered to HTML
	//   { type: 'code', lang, code }       — fenced code block
	let blocks = $derived.by(() => {
		const result: Block[] = [];
		const tokens = marked.lexer(content ?? '');
		let pendingHtml = '';

		for (const tok of tokens) {
			if (tok.type === 'code') {
				if (pendingHtml) {
					result.push({ type: 'html', html: sanitizeHtml.markdown(pendingHtml) });
					pendingHtml = '';
				}
				result.push({ type: 'code', lang: tok.lang, code: tok.text });
			} else {
				// Use marked parser for the non-code token
				pendingHtml += marked.parser([tok]);
			}
		}
		if (pendingHtml) result.push({ type: 'html', html: sanitizeHtml.markdown(pendingHtml) });
		return result;
	});
</script>

<div class="ai-response">
	{#each blocks as block, i (i)}
		{#if block.type === 'code' && block.lang === 'mermaid'}
			<Mermaid code={block.code ?? ''} />
		{:else if block.type === 'code'}
			<Code code={block.code ?? ''} lang={block.lang} />
		{:else}
			<div class="ai-response-markdown">
				{@html block.html}
			</div>
		{/if}
	{/each}
	{#if isStreaming}
		<span class="ai-response-cursor" aria-hidden="true"></span>
	{/if}
</div>
