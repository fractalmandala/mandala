import { describe, expect, it } from 'vitest';
import {
	appendPattern,
	checkHeuristicWarnings,
	countMatches,
	editPatternAt,
	isPathIgnored,
	listPatterns,
	parseOkignoreDoc,
	removePatternAt,
	reorderPatterns,
	serializeOkignoreDoc,
} from './okignore';

describe('okignore doc parser & serializer byte-identical round-trip', () => {
	it('preserves empty and comment lines round-trip', () => {
		const sample = '# Comment 1\n\n  \ndrafts/\n*.tmp\n';
		const doc = parseOkignoreDoc(sample);
		expect(serializeOkignoreDoc(doc)).toBe(sample);
	});

	it('classifies lines correctly into pattern and meta lines', () => {
		const sample = '# Header\n\n  node_modules/  \n*.tmp\n';
		const doc = parseOkignoreDoc(sample);
		const patterns = listPatterns(doc);
		expect(patterns).toHaveLength(2);
		expect(patterns[0].text).toBe('node_modules/');
		expect(patterns[1].text).toBe('*.tmp');
	});

	it('appends patterns without losing trailing newlines', () => {
		const doc = parseOkignoreDoc('a/\n');
		const updated = appendPattern(doc, 'b/');
		expect(serializeOkignoreDoc(updated)).toBe('a/\nb/\n');
	});

	it('edits and removes patterns at specified slots', () => {
		const doc = parseOkignoreDoc('a/\nb/\nc/\n');
		const edited = editPatternAt(doc, 1, 'b-new/');
		expect(serializeOkignoreDoc(edited)).toBe('a/\nb-new/\nc/\n');

		const removed = removePatternAt(edited, 0);
		expect(serializeOkignoreDoc(removed)).toBe('b-new/\nc/\n');
	});

	it('reorders pattern slots while keeping comment positions fixed', () => {
		const sample = '# Comment\na/\nb/\n';
		const doc = parseOkignoreDoc(sample);
		const reordered = reorderPatterns(doc, 0, 1);
		expect(serializeOkignoreDoc(reordered)).toBe('# Comment\nb/\na/\n');
	});
});

describe('okignore heuristic warnings', () => {
	it('detects heuristic warning shapes', () => {
		expect(checkHeuristicWarnings('lone-bang !')).toHaveLength(0);
		expect(checkHeuristicWarnings('!')).toEqual([
			{ code: 'lone-bang', message: 'Lone ! — negation needs a pattern after it.' },
		]);
		expect(checkHeuristicWarnings('drafts\\')).toEqual([
			{ code: 'trailing-backslash', message: "Trailing backslash — line continuation isn't supported." },
		]);
		expect(checkHeuristicWarnings('[invalid')).toEqual([
			{ code: 'unmatched-bracket', message: 'Unmatched [ — character class is open.' },
		]);
		expect(checkHeuristicWarnings('  leading')).toEqual([
			{ code: 'leading-whitespace', message: 'Leading whitespace — the rule may not match as expected.' },
		]);
	});
});

describe('okignore path matching and preview counter', () => {
	it('matches file paths against gitignore patterns', () => {
		const patterns = ['node_modules/', '*.draft.md', 'secret.txt'];
		expect(isPathIgnored('/node_modules/package.json', patterns)).toBe(true);
		expect(isPathIgnored('/content/test.draft.md', patterns)).toBe(true);
		expect(isPathIgnored('/content/secret.txt', patterns)).toBe(true);
		expect(isPathIgnored('/content/Welcome.md', patterns)).toBe(false);
	});

	it('counts matches across file path lists', () => {
		const paths = [
			'/content/Welcome.md',
			'/content/draft.draft.md',
			'/node_modules/express/index.js',
		];
		expect(countMatches('*.draft.md', paths)).toBe(1);
		expect(countMatches('node_modules/', paths)).toBe(1);
		expect(countMatches('*.md', paths)).toBe(2);
	});
});
