import { describe, expect, it } from 'vitest';
import {
	CANONICAL_DOCUMENT_FORMAT,
	SERIALIZATION_ARCHITECTURE,
	SHARED_MARKED_CONFIG,
	describeSerializationDecision,
	editorHtmlToMarkdown,
	markdownToEditorHtml,
	markdownToTiptapJson,
	roundTripMarkdown,
	tiptapJsonToMarkdown,
} from './serialization';

describe('canonical markdown serialization', () => {
	it('documents Markdown as the disk source of truth with TipTap JSON in memory', () => {
		expect(CANONICAL_DOCUMENT_FORMAT).toBe('markdown');
		expect(SERIALIZATION_ARCHITECTURE).toEqual({
			disk: 'markdown',
			memory: 'tiptap-json',
			transport: 'html',
		});
		expect(describeSerializationDecision()).toContain('Markdown');
		expect(describeSerializationDecision()).toContain('TipTap');
	});

	it('exposes a single shared marked configuration for editor and preview', () => {
		// markdown.ts (preview) and this module previously raced two divergent
		// marked.use calls on the global instance (breaks: true vs false).
		expect(SHARED_MARKED_CONFIG).toEqual({ gfm: true, breaks: false });
		// Shared pipeline behaviour: single newlines are not hard breaks, and
		// frontmatter never reaches the body parser.
		expect(markdownToEditorHtml('a\nb')).toBe('<p>a\nb</p>\n');
		expect(markdownToEditorHtml('---\ntitle: T\n---\n\nx\n')).not.toContain('<h2>');
	});

	it('round-trips headings, emphasis, lists, code, quotes, rules, and links', () => {
		const source = [
			'# Title',
			'',
			'A **bold** and _italic_ word with a [link](https://example.test).',
			'',
			'- one',
			'- two',
			'  - nested',
			'',
			'1. alpha',
			'2. beta',
			'',
			'> quoted',
			'',
			'```js',
			'const x = 1',
			'```',
			'',
			'---',
			'',
		].join('\n');

		const html = markdownToEditorHtml(source);
		expect(html).toContain('<h1');
		expect(html).toContain('<strong>');
		expect(html).toContain('<em>');
		expect(html).toContain('<a href="https://example.test"');
		expect(html).toContain('<blockquote>');
		expect(html).toContain('<pre>');
		expect(html).toContain('<hr');

		const json = markdownToTiptapJson(source);
		expect(json.type).toBe('doc');
		expect(json.content?.some((node) => node.type === 'heading')).toBe(true);

		const markdown = tiptapJsonToMarkdown(json);
		expect(markdown).toContain('# Title');
		expect(markdown).toContain('**bold**');
		expect(markdown).toContain('_italic_');
		expect(markdown).toContain('[link](https://example.test)');
		expect(markdown).toContain('- one');
		expect(markdown).toContain('> quoted');
		expect(markdown).toContain('```js');
		expect(markdown).toContain('---');

		const roundTrip = roundTripMarkdown(source);
		expect(roundTrip).toContain('Title');
		expect(editorHtmlToMarkdown(html)).toContain('Title');
	});

	it('preserves YAML frontmatter byte-faithfully across parse/serialize', () => {
		const source = [
			'---',
			'title: Hello',
			'tags: [a, b]',
			'draft: false',
			'---',
			'',
			'# Body',
			'',
			'Text.',
			'',
		].join('\n');

		const once = roundTripMarkdown(source);
		expect(once).toBe(source);
		// Idempotent: a second trip changes nothing.
		expect(roundTripMarkdown(once)).toBe(once);

		const json = markdownToTiptapJson(source);
		expect(tiptapJsonToMarkdown(json)).toBe(source);
	});

	it('does not mangle frontmatter closing fences into setext headings', () => {
		const source = '---\ntitle: Hello\n---\n\nBody text.\n';
		const html = markdownToEditorHtml(source);
		expect(html).not.toContain('<h2>');
		const roundTrip = roundTripMarkdown(source);
		expect(roundTrip).toContain('---\ntitle: Hello\n---');
		expect(roundTrip).toContain('Body text.');
	});

	it('preserves task list checked state across round-trips', () => {
		const source = '- [ ] todo\n- [x] done\n\n1. one\n   - [ ] nested task\n';
		const once = roundTripMarkdown(source);
		expect(once).toContain('- [ ] todo');
		expect(once).toContain('- [x] done');
		expect(once).toContain('- [ ] nested task');
		expect(once).not.toContain('<input');
		// Stable after the first trip.
		expect(roundTripMarkdown(once)).toBe(once);

		const json = markdownToTiptapJson(source);
		expect(tiptapJsonToMarkdown(json)).toContain('- [x] done');
	});

	it('keeps escaped punctuation literal instead of re-interpreting it', () => {
		const source = '\\*stars\\* and \\_under\\_ and \\[brackets\\]\n';
		const once = roundTripMarkdown(source);
		expect(once).toBe(source);
		expect(roundTripMarkdown(once)).toBe(once);

		// The JSON bridge applies the same escaping.
		const json = markdownToTiptapJson(source);
		expect(tiptapJsonToMarkdown(json)).toBe(source);
	});

	it('does not double-escape backticks inside inline code', () => {
		const source = 'Use `` `code` `` here and `plain` too.\n';
		const once = roundTripMarkdown(source);
		expect(once).toBe(source);
		expect(roundTripMarkdown(once)).toBe(once);
	});

	it('serializes multi-line and multi-paragraph blockquotes idempotently', () => {
		const multiLine = '> line one\n> line two\n';
		expect(roundTripMarkdown(multiLine)).toBe(multiLine);

		const multiParagraph = '> a\n>\n> b\n';
		const once = roundTripMarkdown(multiParagraph);
		expect(once).toBe(multiParagraph);
		expect(roundTripMarkdown(once)).toBe(once);

		// No empty quote lines may be injected from DOM whitespace nodes.
		expect(once).not.toContain('> \n');
	});

	it('is idempotent for mixed nested lists and code blocks', () => {
		const source = '1. one\n   - sub\n2. two\n\n```js {1-2}\nconst x = 1\n```\n';
		const once = roundTripMarkdown(source);
		expect(once).toContain('1. one\n   - sub\n2. two');
		// marked keeps only the first info-string word as the language class;
		// that normalization is stable after the first trip.
		expect(once).toContain('```js\n');
		expect(roundTripMarkdown(once)).toBe(once);
	});
});
