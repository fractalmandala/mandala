import { describe, expect, it } from 'vitest';
import { renderMarkdownResult } from './markdown';

describe('markdown preview rendering', () => {
	it('marks external links safe and blocks unsafe protocols', () => {
		const result = renderMarkdownResult('[Open](https://example.com) [Bad](javascript:alert(1))');

		expect(result.error).toBeNull();
		expect(result.html).toContain('href="https://example.com" target="_blank" rel="noreferrer noopener"');
		expect(result.html).toContain('href="#"');
		expect(result.html).not.toContain('javascript:alert');
	});

	it('renders markdown images with preview-friendly markup', () => {
		const result = renderMarkdownResult('![Preview](/assets/hero.webp)');

		expect(result.error).toBeNull();
		expect(result.features.images).toBe(true);
		expect(result.html).toContain('<img src="/assets/hero.webp" alt="Preview">');
	});

	it('wraps Mermaid fences in a renderable figure mount', () => {
		const result = renderMarkdownResult('```mermaid\ngraph TD\n\tA --> B\n```');

		expect(result.error).toBeNull();
		expect(result.features.mermaid).toBe(true);
		expect(result.mermaidBlocks.length).toBe(1);
		expect(result.html).toContain('class="mermaid-figure"');
		expect(result.html).toContain('data-mermaid-target');
		expect(result.html).toContain('Mermaid diagram');
	});

	it('detects MDX syntax and keeps JSX escaped', () => {
		const result = renderMarkdownResult('<Callout tone="info">Hello</Callout>');

		expect(result.error).toBeNull();
		expect(result.features.mdxFallback).toBe(true);
		expect(result.html).toContain('&lt;Callout tone=&quot;info&quot;&gt;Hello&lt;/Callout&gt;');
	});
});
