import { describe, expect, it } from 'vitest';
import {
	collectCommandTags,
	filterTagList,
	formatTagQuery,
	parseTagPaletteQuery,
	TAG_QUERY_PREFIX,
} from './command-palette-tags';
import type { CommandItem } from './types';

const sampleCommands: CommandItem[] = [
	{
		id: 'a',
		title: 'A',
		group: 'FILE',
		tags: ['files', 'git'],
		run: () => undefined,
	},
	{
		id: 'b',
		title: 'B',
		group: 'APPLICATION',
		tags: ['help', 'bug'],
		run: () => undefined,
	},
];

describe('command palette tag search', () => {
	it('uses TAG_QUERY_PREFIX #', () => {
		expect(TAG_QUERY_PREFIX).toBe('#');
	});

	it('parses normal, tag-list, and tag-filter modes', () => {
		const known = new Set(['files', 'git', 'help']);
		expect(parseTagPaletteQuery('settings', known)).toEqual({ kind: 'normal', query: 'settings' });
		expect(parseTagPaletteQuery('#', known)).toEqual({ kind: 'tag-list', query: '' });
		expect(parseTagPaletteQuery('#fi', known)).toEqual({ kind: 'tag-list', query: 'fi' });
		expect(parseTagPaletteQuery('#files', known)).toEqual({
			kind: 'tag-filter',
			tag: 'files',
			text: '',
		});
		expect(parseTagPaletteQuery('#files open', known)).toEqual({
			kind: 'tag-filter',
			tag: 'files',
			text: 'open',
		});
	});

	it('collects and filters tags', () => {
		const tags = collectCommandTags(sampleCommands);
		expect(tags).toEqual(['bug', 'files', 'git', 'help']);
		expect(filterTagList(tags, 'g')).toEqual(['git', 'bug']);
		expect(filterTagList(tags, 'help')).toEqual(['help']);
	});

	it('formats tag queries', () => {
		expect(formatTagQuery('files')).toBe('#files');
		expect(formatTagQuery('files', 'rename')).toBe('#files rename');
	});
});
