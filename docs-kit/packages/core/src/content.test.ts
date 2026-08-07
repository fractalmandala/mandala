import { describe, expect, it } from 'vitest';

import {
	contentExtensionFromPath,
	pathToSlug,
	pathToSlugSegments,
	slugToPathname
} from './content.js';

describe('content identity paths', () => {
	it.each([
		['./getting-started.md', ['getting-started'], 'getting-started', '/getting-started'],
		['guide/index.svx', ['guide'], 'guide', '/guide'],
		['index.md', [], '', '/'],
		['nested\\windows-path.md', ['nested', 'windows-path'], 'nested/windows-path', '/nested/windows-path']
	])('normalizes %s', (path, segments, slug, pathname) => {
		expect(pathToSlugSegments(path)).toEqual(segments);
		expect(pathToSlug(path)).toBe(slug);
		expect(slugToPathname(slug)).toBe(pathname);
	});

	it('recognizes only supported content extensions', () => {
		expect(contentExtensionFromPath('page.md')).toBe('.md');
		expect(contentExtensionFromPath('page.svx')).toBe('.svx');
		expect(contentExtensionFromPath('page.mdx')).toBeUndefined();
	});
});
