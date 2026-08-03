import type { AskBlock } from '$lib/state/ask.svelte';

/**
 * Best-effort markdown → AskBlock[] for the Ask transcript.
 * Keeps headings, lists, fenced code, and paragraphs — enough for chat answers.
 */
export function markdownToBlocks(markdown: string): AskBlock[] {
	const text = markdown.replace(/\r\n/g, '\n').trim();
	if (!text) return [{ type: 'p', text: '' }];

	const blocks: AskBlock[] = [];
	const lines = text.split('\n');
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// fenced code
		const fence = line.match(/^```(.*)$/);
		if (fence) {
			i++;
			const codeLines: string[] = [];
			while (i < lines.length && !lines[i].startsWith('```')) {
				codeLines.push(lines[i]);
				i++;
			}
			if (i < lines.length) i++; // closing fence
			blocks.push({ type: 'code', lines: codeLines });
			continue;
		}

		// heading
		const heading = line.match(/^#{1,3}\s+(.+)$/);
		if (heading) {
			blocks.push({ type: 'h', text: heading[1].trim() });
			i++;
			continue;
		}

		// unordered / ordered list run
		if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
			const items: string[] = [];
			while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
				items.push(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, '').trim());
				i++;
			}
			blocks.push({ type: 'list', items });
			continue;
		}

		// blank
		if (!line.trim()) {
			i++;
			continue;
		}

		// paragraph (consume consecutive non-special lines)
		const para: string[] = [];
		while (
			i < lines.length &&
			lines[i].trim() &&
			!lines[i].startsWith('```') &&
			!/^#{1,3}\s+/.test(lines[i]) &&
			!/^\s*([-*+]|\d+\.)\s+/.test(lines[i])
		) {
			para.push(lines[i].trim());
			i++;
		}
		blocks.push({ type: 'p', text: para.join(' ') });
	}

	return blocks.length ? blocks : [{ type: 'p', text }];
}

/** While streaming: keep a single live paragraph so the caret can trail the end. */
export function streamingBlocks(raw: string): AskBlock[] {
	const text = raw.replace(/\r\n/g, '\n');
	if (!text) return [{ type: 'p', text: '' }];
	// Prefer full parse once we have structure; fall back to one growing block early on.
	if (text.includes('\n\n') || text.includes('```') || /^#{1,3}\s/m.test(text)) {
		return markdownToBlocks(text);
	}
	return [{ type: 'p', text }];
}
