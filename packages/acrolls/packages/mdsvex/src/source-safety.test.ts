import { describe, expect, it } from 'vitest';
import { normalizeAcrollsMarkdown } from './source-safety.js';

describe('normalizeAcrollsMarkdown', () => {
	it('wraps Svelte-shaped literals and generic types in Markdown prose', () => {
		const result = normalizeAcrollsMarkdown(
			'- Add <svelte:head> and return Result<T, String> for content/<Category>.'
		);

		expect(result.changed).toBe(true);
		expect(result.source).toContain('`<svelte:head>`');
		expect(result.source).toContain('`Result<T, String>`');
		expect(result.source).toContain('`<Category>`');
		expect(result.findings).toHaveLength(3);
	});

	it('preserves fenced and inline code', () => {
		const source = [
			'Inline `Result<T, String>` stays as written.',
			'',
			'```ts',
			'const value: Result<T, String> = getValue();',
			'```'
		].join('\n');

		const result = normalizeAcrollsMarkdown(source);

		expect(result.changed).toBe(false);
		expect(result.findings).toHaveLength(0);
		expect(result.source).toBe(source);
	});

	it('does not rewrite recovered Mermaid source before the remark guard', () => {
		const source = ['flowchart TD', '  Start{Record: string} --> End[Done]', '', 'Text'].join('\n');
		const result = normalizeAcrollsMarkdown(source);

		expect(result.changed).toBe(false);
		expect(result.findings).toHaveLength(0);
	});

	it('does not rewrite intentional components in SVX', () => {
		const source = '<Callout title="Careful">Use <svelte:head>.</Callout>';
		const result = normalizeAcrollsMarkdown(source, { filename: 'article.svx' });

		expect(result.changed).toBe(false);
		expect(result.findings).toHaveLength(0);
		expect(result.source).toBe(source);
	});

	it('reports source locations', () => {
		const result = normalizeAcrollsMarkdown('safe\n- Result<T, String> is literal.');

		expect(result.findings[0]).toMatchObject({ line: 2, column: 3, kind: 'generic-type-literal' });
	});
});
