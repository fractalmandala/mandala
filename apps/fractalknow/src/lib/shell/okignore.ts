import { derived, get, writable } from 'svelte/store';
import type { OkDesktopBridge } from '$lib/desktop';

export interface PatternLine {
	kind: 'pattern';
	raw: string;
	text: string;
}

export interface MetaLine {
	kind: 'comment' | 'blank';
	raw: string;
}

export type Line = PatternLine | MetaLine;

export interface ParsedDoc {
	lines: Line[];
}

export function classifyLine(raw: string): Line {
	const trimmed = raw.trim();
	if (trimmed.length === 0) return { kind: 'blank', raw };
	if (trimmed.startsWith('#')) return { kind: 'comment', raw };
	return { kind: 'pattern', raw, text: trimmed };
}

export function parseOkignoreDoc(text: string): ParsedDoc {
	const rawLines = text.split('\n');
	const lines: Line[] = rawLines.map(classifyLine);
	return { lines };
}

export function serializeOkignoreDoc(doc: ParsedDoc): string {
	return doc.lines.map((line) => line.raw).join('\n');
}

export function listPatterns(doc: ParsedDoc): PatternLine[] {
	return doc.lines.filter((line): line is PatternLine => line.kind === 'pattern');
}

export function appendPattern(doc: ParsedDoc, newText: string): ParsedDoc {
	const trimmed = newText.trim();
	if (trimmed.length === 0) return doc;
	for (const line of doc.lines) {
		if (line.kind === 'pattern' && line.text === trimmed) return doc;
	}
	const newLine: PatternLine = { kind: 'pattern', raw: trimmed, text: trimmed };
	const lines = doc.lines.slice();
	const last = lines[lines.length - 1];
	if (last && last.kind === 'blank' && last.raw === '') {
		lines.splice(lines.length - 1, 0, newLine);
	} else {
		lines.push(newLine, { kind: 'blank', raw: '' });
	}
	return { lines };
}

export function findPatternIndex(doc: ParsedDoc, patternText: string): number {
	const trimmed = patternText.trim();
	if (trimmed.length === 0) return -1;
	let seen = 0;
	for (const line of doc.lines) {
		if (line.kind === 'pattern') {
			if (line.text === trimmed) return seen;
			seen++;
		}
	}
	return -1;
}

export function editPatternAt(doc: ParsedDoc, patternIndex: number, newText: string): ParsedDoc {
	const trimmed = newText.trim();
	if (trimmed.length === 0) return removePatternAt(doc, patternIndex);
	const slot = findNthPatternSlot(doc, patternIndex);
	if (slot < 0) return doc;
	const lines = doc.lines.slice();
	lines[slot] = { kind: 'pattern', raw: trimmed, text: trimmed };
	return { lines };
}

export function removePatternAt(doc: ParsedDoc, patternIndex: number): ParsedDoc {
	const slot = findNthPatternSlot(doc, patternIndex);
	if (slot < 0) return doc;
	const lines = doc.lines.slice();
	lines.splice(slot, 1);
	return { lines };
}

export function reorderPatterns(doc: ParsedDoc, fromIndex: number, toIndex: number): ParsedDoc {
	if (fromIndex === toIndex) return doc;
	const slots: number[] = [];
	const patterns: PatternLine[] = [];
	doc.lines.forEach((line, i) => {
		if (line.kind === 'pattern') {
			slots.push(i);
			patterns.push(line);
		}
	});
	if (fromIndex < 0 || fromIndex >= patterns.length || toIndex < 0 || toIndex >= patterns.length) {
		return doc;
	}
	const reordered = patterns.slice();
	const [moved] = reordered.splice(fromIndex, 1);
	if (!moved) return doc;
	reordered.splice(toIndex, 0, moved);
	const lines = doc.lines.slice();
	slots.forEach((slotIdx, i) => {
		const next = reordered[i];
		if (next) lines[slotIdx] = next;
	});
	return { lines };
}

function findNthPatternSlot(doc: ParsedDoc, patternIndex: number): number {
	if (patternIndex < 0) return -1;
	let seen = 0;
	for (let i = 0; i < doc.lines.length; i++) {
		if (doc.lines[i]?.kind === 'pattern') {
			if (seen === patternIndex) return i;
			seen++;
		}
	}
	return -1;
}

/* Warnings */

export type OkignoreWarningCode =
	| 'trailing-backslash'
	| 'unmatched-bracket'
	| 'lone-bang'
	| 'leading-whitespace'
	| 'embedded-newline';

export interface OkignoreWarning {
	readonly code: OkignoreWarningCode;
	readonly message: string;
}

export const WARNING_MESSAGES: Record<OkignoreWarningCode, string> = {
	'trailing-backslash': "Trailing backslash — line continuation isn't supported.",
	'unmatched-bracket': 'Unmatched [ — character class is open.',
	'lone-bang': 'Lone ! — negation needs a pattern after it.',
	'leading-whitespace': 'Leading whitespace — the rule may not match as expected.',
	'embedded-newline': 'Embedded line break — the row spans multiple lines.',
};

export function checkHeuristicWarnings(line: string): OkignoreWarning[] {
	const warnings: OkignoreWarning[] = [];
	if (line.length === 0) return warnings;
	if (line.trimStart().startsWith('#')) return warnings;

	if (/[\r\n]/.test(line)) {
		warnings.push({ code: 'embedded-newline', message: WARNING_MESSAGES['embedded-newline'] });
	}
	if (/^\s/.test(line)) {
		warnings.push({ code: 'leading-whitespace', message: WARNING_MESSAGES['leading-whitespace'] });
	}

	const trimmed = line.trim();
	if (trimmed === '!') {
		warnings.push({ code: 'lone-bang', message: WARNING_MESSAGES['lone-bang'] });
	}
	if (trimmed.endsWith('\\')) {
		warnings.push({
			code: 'trailing-backslash',
			message: WARNING_MESSAGES['trailing-backslash'],
		});
	}

	let opens = 0;
	let closes = 0;
	for (let i = 0; i < trimmed.length; i++) {
		if (trimmed[i] === '[') opens++;
		if (trimmed[i] === ']') closes++;
	}
	if (opens > closes) {
		warnings.push({ code: 'unmatched-bracket', message: WARNING_MESSAGES['unmatched-bracket'] });
	}

	return warnings;
}

/* Pattern Matcher & Preview Helper */

export function isPathIgnored(path: string, patterns: string[]): boolean {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	const segments = normalized.split('/').filter(Boolean);

	for (let rawPattern of patterns) {
		let pattern = rawPattern.trim();
		if (!pattern || pattern.startsWith('#')) continue;

		let isNegated = false;
		if (pattern.startsWith('!')) {
			isNegated = true;
			pattern = pattern.slice(1).trim();
		}

		let isDirectoryOnly = false;
		if (pattern.endsWith('/')) {
			isDirectoryOnly = true;
			pattern = pattern.slice(0, -1);
		}

		if (!pattern) continue;

		// Pure wildcard or segment match
		const cleanPattern = pattern.replace(/^\//, '');
		const regexPattern = cleanPattern
			.replace(/\./g, '\\.')
			.replace(/\*\*/g, '.*')
			.replace(/\*/g, '[^/]*')
			.replace(/\?/g, '.');

		const regex = new RegExp(`(?:^|/)${regexPattern}(?:/|$)`, 'i');

		if (regex.test(normalized) || segments.some((s) => s === cleanPattern)) {
			if (isNegated) return false;
			return true;
		}
	}

	return false;
}

export function countMatches(pattern: string, filePaths: ReadonlyArray<string>): number {
	const trimmed = pattern.trim();
	if (trimmed.length === 0 || trimmed.startsWith('#') || trimmed === '!') return 0;
	let matches = 0;
	for (const path of filePaths) {
		if (path.length === 0) continue;
		if (isPathIgnored(path, [trimmed])) matches += 1;
	}
	return matches;
}

/* Default state & Store */

export const defaultOkignoreText = `# Default ignore patterns
node_modules/
.git/
.ok/cache/
target/
*.tmp
`;

export const okignoreText = writable<string>(defaultOkignoreText);

export const okignorePatterns = derived(okignoreText, ($text) =>
	listPatterns(parseOkignoreDoc($text)).map((p) => p.text),
);

export async function loadOkignore(bridge: OkDesktopBridge | null): Promise<string> {
	if (!bridge || bridge.runtime !== 'tauri') {
		okignoreText.set(defaultOkignoreText);
		return defaultOkignoreText;
	}
	try {
		const { readProjectPath, createProjectPath } = await import('$lib/editor/project-files');
		const res = await readProjectPath('.okignore');
		if (res && 'content' in res && typeof res.content === 'string') {
			okignoreText.set(res.content);
			return res.content;
		}
		await createProjectPath('.okignore', 'file', defaultOkignoreText);
	} catch {
		// File does not exist yet; initialize default
	}
	okignoreText.set(defaultOkignoreText);
	return defaultOkignoreText;
}

export async function saveOkignore(bridge: OkDesktopBridge | null, text: string): Promise<void> {
	okignoreText.set(text);
	if (bridge && bridge.runtime === 'tauri') {
		const { writeProjectPath } = await import('$lib/editor/project-files');
		await writeProjectPath('.okignore', text);
	}
}
