import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from '$lib/modules/notes/frontmatter';

describe('lossless note frontmatter parsing', () => {
	it('preserves unknown fields and exact prefix bytes', () => {
		const source = '---\ntitle: Example\ndraft: true\naliases: [one, two]\ncustom:\n  nested: value\n---\n\n# Body\n';
		const parsed = parseFrontmatter(source);
		expect(parsed.prefix + parsed.body).toBe(source);
		expect(parsed.prefix).toContain('custom:\n  nested: value');
		expect(parsed.frontmatter?.title).toBe('Example');
	});

	it('understands inline tags without rewriting them', () => {
		const source = '---\ntags: [one, "two words"]\n---\nBody';
		const parsed = parseFrontmatter(source);
		expect(parsed.frontmatter?.tags).toEqual(['one', 'two words']);
		expect(parsed.prefix + parsed.body).toBe(source);
	});

	it('does not mistake a body horizontal rule for frontmatter', () => {
		const source = '# Heading\n\n---\n\nBody';
		expect(parseFrontmatter(source)).toEqual({ frontmatter: null, body: source, prefix: '' });
	});

	it('parses files with new document types (area, guide, plan, archive)', () => {
		const source = '---\ntitle: Area Document\ntype: area\ntags: [designer, canvas]\nsummary: Hello world\n---\nBody';
		const parsed = parseFrontmatter(source);
		expect(parsed.frontmatter?.title).toBe('Area Document');
		expect(parsed.frontmatter?.tags).toEqual(['designer', 'canvas']);
	});
});
