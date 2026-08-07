// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
	formatDocsFileName,
	plainTextFromInlineHtml,
	renderDocsMarkdown,
	slugifyHeading,
} from '$lib/modules/fractaldocs/state/docs.svelte';

describe('FractalDocs markdown rendering contract', () => {
	it('uses the same unique heading IDs for rendered content and the table of contents', () => {
		const rendered = renderDocsMarkdown([
			'# API [reference](https://example.com)',
			'## `Inline` details',
			'## Inline details',
		].join('\n\n'));

		expect(rendered.toc).toEqual([
			{ depth: 1, text: 'API reference', id: 'api-reference' },
			{ depth: 2, text: 'Inline details', id: 'inline-details' },
			{ depth: 2, text: 'Inline details', id: 'inline-details-1' },
		]);
		for (const heading of rendered.toc) {
			expect(rendered.html).toContain(`id="${heading.id}"`);
		}
	});

	it('keeps rendered Markdown inside the shared sanitization boundary', () => {
		const rendered = renderDocsMarkdown('# Safe\n\n<script>alert("unsafe")</script>');
		expect(rendered.html).not.toContain('<script>');
	});

	it('creates human-readable labels without reading every document from IPC', () => {
		expect(formatDocsFileName('INDEX.md')).toBe('Overview');
		expect(formatDocsFileName('ADR-026-core_undo-engine.md')).toBe('ADR 026 core undo engine');
		expect(plainTextFromInlineHtml('API <a href="/">reference</a>')).toBe('API reference');
		expect(slugifyHeading('API reference')).toBe('api-reference');
	});
});
