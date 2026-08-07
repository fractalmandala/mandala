import { describe, expect, it } from 'vitest';

import {
	extractDocsHeadings,
	extractDocsTitle,
	slugifyHeading,
	splitDocsFrontmatter,
	splitDocsSections
} from './markdown.js';

const document = [
	'---',
	'title: Installation',
	'---',
	'',
	'# Installation',
	'',
	'Intro text.',
	'',
	'## Install',
	'',
	'```bash',
	'# not a heading',
	'pnpm add docs-kit',
	'```',
	'',
	'### Windows',
	'',
	'Notes.',
	'',
	'## Install',
	'',
	'Duplicate heading.'
].join('\n');

describe('splitDocsFrontmatter', () => {
	it('separates frontmatter from the body', () => {
		const { frontmatter, body } = splitDocsFrontmatter(document);

		expect(frontmatter).toBe('title: Installation');
		expect(body.startsWith('\n# Installation')).toBe(true);
		expect(splitDocsFrontmatter('# No frontmatter')).toEqual({
			frontmatter: '',
			body: '# No frontmatter'
		});
	});
});

describe('extractDocsHeadings', () => {
	it('ignores code fences and gives duplicate headings unique ids', () => {
		expect(extractDocsHeadings(document)).toEqual([
			{ id: 'installation', text: 'Installation', depth: 1, line: 2 },
			{ id: 'install', text: 'Install', depth: 2, line: 6 },
			{ id: 'windows', text: 'Windows', depth: 3, line: 13 },
			{ id: 'install-1', text: 'Install', depth: 2, line: 17 }
		]);
		expect(extractDocsTitle(document)).toBe('Installation');
	});

	it('slugifies punctuation, code spans, and links', () => {
		expect(slugifyHeading('`docs sync` & friends')).toBe('docs-sync-friends');
		expect(slugifyHeading('[Deploy](/docs/deploy)')).toBe('deploy');
		expect(slugifyHeading('!!!')).toBe('section');
	});
});

describe('splitDocsSections', () => {
	it('produces heading-scoped sections with ancestor paths', () => {
		const sections = splitDocsSections(document);

		expect(sections.map((section) => [section.heading?.text, section.path])).toEqual([
			['Installation', []],
			['Install', ['Installation']],
			['Windows', ['Installation', 'Install']],
			['Install', ['Installation']]
		]);
		expect(sections[1]?.content).toContain('pnpm add docs-kit');
		expect(sections[2]?.content).toContain('Notes.');
	});

	it('keeps content that appears before the first heading', () => {
		const sections = splitDocsSections('Lead paragraph.\n\n# Title\n\nBody.');

		expect(sections[0]).toMatchObject({ path: [], content: 'Lead paragraph.' });
		expect(sections[1]?.heading?.text).toBe('Title');
	});

	it('handles documents without headings', () => {
		expect(splitDocsSections('Just text.')).toEqual([
			{ path: [], content: 'Just text.', startLine: 1, endLine: 1 }
		]);
	});
});
