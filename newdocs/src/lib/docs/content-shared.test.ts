import { describe, expect, it } from 'vitest';
import {
	candidatePaths,
	parseFrontmatter,
	slugFromPath,
	titleFromMeta
} from './content-shared.js';
import { rewriteMdHref } from './md-links.js';
import { buildNavTree, flattenNav } from './nav-tree.js';
import { renderMarkdown } from './render-markdown.js';
import type { DocListItem } from './content-shared.js';

describe('slugFromPath', () => {
	it('strips content root and extension', () => {
		expect(slugFromPath('/src/content/repo/getting-started.md')).toBe('repo/getting-started');
	});

	it('maps INDEX.md to parent folder', () => {
		expect(slugFromPath('/src/content/projects/INDEX.md')).toBe('projects');
		expect(slugFromPath('/src/content/projects/sites/INDEX.md')).toBe('projects/sites');
	});

	it('maps root INDEX to empty slug', () => {
		expect(slugFromPath('/src/content/INDEX.md')).toBe('');
	});
});

describe('candidatePaths', () => {
	it('includes leaf and INDEX variants', () => {
		const paths = candidatePaths('projects/sites');
		expect(paths).toContain('/src/content/projects/sites.md');
		expect(paths).toContain('/src/content/projects/sites/INDEX.md');
		expect(paths).toContain('/src/content/projects/sites/index.md');
	});

	it('handles empty slug (content root)', () => {
		expect(candidatePaths('')).toEqual([
			'/src/content/INDEX.md',
			'/src/content/index.md'
		]);
	});
});

describe('parseFrontmatter', () => {
	it('parses YAML arrays and nested sidebar', () => {
		const src = `---
title: Hello
tags: [a, b, c]
order: 2
sidebar:
  label: Side
draft: false
---

# Body
`;
		const meta = parseFrontmatter(src);
		expect(meta.title).toBe('Hello');
		expect(meta.tags).toEqual(['a', 'b', 'c']);
		expect(meta.order).toBe(2);
		expect(meta.sidebar).toEqual({ label: 'Side' });
		expect(meta.draft).toBe(false);
	});

	it('returns empty object without frontmatter', () => {
		expect(parseFrontmatter('# just markdown')).toEqual({});
	});
});

describe('titleFromMeta', () => {
	it('prefers title then sidebar label then slug tail', () => {
		expect(titleFromMeta({ title: 'T' }, 'a/b')).toBe('T');
		expect(titleFromMeta({ sidebar: { label: 'L' } }, 'a/b')).toBe('L');
		expect(titleFromMeta({}, 'a/b')).toBe('b');
	});
});

describe('rewriteMdHref', () => {
	const from = '/Users/x/newdocs/src/content/projects/INDEX.md';

	it('rewrites relative INDEX.md to /docs path', () => {
		expect(rewriteMdHref('sites/INDEX.md', from)).toBe('/docs/projects/sites');
	});

	it('rewrites sibling leaf md', () => {
		expect(rewriteMdHref('../repo/getting-started.md', from)).toBe(
			'/docs/repo/getting-started'
		);
	});

	it('preserves external URLs and hashes-only', () => {
		expect(rewriteMdHref('https://example.com/a.md', from)).toBe('https://example.com/a.md');
		expect(rewriteMdHref('#section', from)).toBe('#section');
	});

	it('keeps hash fragments on rewritten links', () => {
		expect(rewriteMdHref('sites/INDEX.md#top', from)).toBe('/docs/projects/sites#top');
	});
});

describe('renderMarkdown', () => {
	it('strips frontmatter and rewrites relative md links', () => {
		const src = `---
title: T
---

See [sites](sites/INDEX.md) and <500 lines.
`;
		const html = renderMarkdown(src, '/src/content/projects/INDEX.md');
		expect(html).toContain('/docs/projects/sites');
		expect(html).toContain('&lt;500');
		expect(html).not.toContain('title: T');
	});
});

describe('buildNavTree / flattenNav', () => {
	const docs: DocListItem[] = [
		{
			slug: 'projects',
			title: 'Projects',
			description: '',
			tags: [],
			href: '/docs/projects',
			path: '/src/content/projects/INDEX.md',
			sourcePath: 'src/content/projects/INDEX.md',
			meta: { order: 0 }
		},
		{
			slug: 'projects/sites',
			title: 'Sites',
			description: '',
			tags: [],
			href: '/docs/projects/sites',
			path: '/src/content/projects/sites/INDEX.md',
			sourcePath: 'src/content/projects/sites/INDEX.md',
			meta: { order: 1 }
		},
		{
			slug: 'projects/sites/foo',
			title: 'Foo',
			description: '',
			tags: [],
			href: '/docs/projects/sites/foo',
			path: '/src/content/projects/sites/foo.md',
			sourcePath: 'src/content/projects/sites/foo.md',
			meta: { order: 2 }
		}
	];

	it('nests by path segments', () => {
		const tree = buildNavTree(docs, 'projects');
		expect(tree.length).toBeGreaterThan(0);
		const sites = tree.find((n) => n.title === 'Sites' || n.href === '/docs/projects/sites');
		expect(sites).toBeTruthy();
		expect(sites?.items?.some((c) => c.href === '/docs/projects/sites/foo')).toBe(true);
	});

	it('flattens in tree order for prev/next', () => {
		const tree = buildNavTree(docs, 'projects');
		const flat = flattenNav([{ title: 'Projects', items: tree }]);
		const hrefs = flat.map((i) => i.href);
		expect(hrefs).toContain('/docs/projects/sites/foo');
	});
});
