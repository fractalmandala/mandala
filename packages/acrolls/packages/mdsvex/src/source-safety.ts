export type AcrollsSafetyFindingKind =
	| 'svelte-literal'
	| 'generic-type-literal'
	| 'object-literal';

export type AcrollsSafetyFinding = {
	kind: AcrollsSafetyFindingKind;
	line: number;
	column: number;
	text: string;
	message: string;
};

export type AcrollsSourceSafetyResult = {
	source: string;
	findings: AcrollsSafetyFinding[];
	changed: boolean;
};

type SafetyPattern = {
	kind: AcrollsSafetyFindingKind;
	pattern: RegExp;
	message: string;
};

const MERMAID_DECLARATION = /^(?:(?:graph|flowchart)\s+(?:TB|TD|BT|RL|LR)\b|(?:sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|gitGraph|quadrantChart|timeline|mindmap|architecture|block-beta|packet-beta|xychart-beta|zenuml)(?:\s|$))/i;

/**
 * Literal constructs that Svelte may interpret when they appear in Markdown
 * prose. Keep this list deliberately narrow: `.svx` remains the escape hatch
 * for intentional Svelte markup and component syntax.
 */
const SAFETY_PATTERNS: SafetyPattern[] = [
	{
		kind: 'svelte-literal',
		pattern: /<\/?svelte:(?:head|window|body|component|element|self)\b[^>]*>/g,
		message: 'Svelte special tags in Markdown prose are wrapped as literal code.'
	},
	{
		kind: 'svelte-literal',
		pattern: /<[A-Z][A-Za-z0-9_-]*>/g,
		message: 'Component-shaped angle brackets in Markdown prose are wrapped as literal code.'
	},
	{
		kind: 'generic-type-literal',
		pattern: /\b(?:Result|Option|Vec|State|Array|Record|Promise|Set|Map)<[A-Za-z][^>\n]*>/g,
		message: 'Generic type syntax in Markdown prose is wrapped as literal code.'
	},
	{
		kind: 'object-literal',
		pattern: /\{\s*[A-Za-z_$][A-Za-z0-9_$-]*\s*:\s*[^{}\n]{1,100}\}/g,
		message: 'Object-literal syntax in Markdown prose is wrapped as literal code.'
	}
];

function isMarkdownFilename(filename?: string): boolean {
	if (!filename) return true;
	return /(?:^|\.)md$/i.test(filename);
}

function transformSegment(
	segment: string,
	line: number,
	columnOffset: number,
	findings: AcrollsSafetyFinding[]
): string {
	const matches = SAFETY_PATTERNS.flatMap((entry) =>
		Array.from(segment.matchAll(entry.pattern), (match) => ({
			entry,
			text: match[0],
			offset: match.index ?? 0
		}))
	).sort((a, b) => a.offset - b.offset);

	let cursor = 0;
	let result = '';
	for (const match of matches) {
		if (match.offset < cursor) continue;
		result += segment.slice(cursor, match.offset);
		result += `\`${match.text}\``;
		findings.push({
			kind: match.entry.kind,
			line,
			column: columnOffset + match.offset + 1,
			text: match.text,
			message: match.entry.message
		});
		cursor = match.offset + match.text.length;
	}
	return result + segment.slice(cursor);
}

function transformLine(
	lineText: string,
	line: number,
	findings: AcrollsSafetyFinding[]
): string {
	const parts = lineText.split(/(`+[^`]*`+)/g);
	let offset = 0;
	return parts
		.map((part, index) => {
			const next = index % 2 === 0 ? transformSegment(part, line, offset, findings) : part;
			offset += part.length;
			return next;
		})
		.join('');
}

/**
 * Normalize only Markdown prose that would otherwise be interpreted as
 * Svelte syntax. Fenced code and existing inline code are preserved. `.svx`
 * sources are intentionally left untouched because they may contain real
 * components.
 */
export function normalizeAcrollsMarkdown(
	source: string,
	options: { filename?: string } = {}
): AcrollsSourceSafetyResult {
	if (!isMarkdownFilename(options.filename)) {
		return { source, findings: [], changed: false };
	}

	const findings: AcrollsSafetyFinding[] = [];
	let fenced = false;
	let mermaidBlock = false;
	const lines = source.split(/(\r?\n)/);
	const normalized = lines
		.map((part, index) => {
			if (/\r?\n/.test(part)) return part;
			const fence = /^\s*(`{3,}|~{3,})/.test(part);
			if (fence) {
				fenced = !fenced;
				return part;
			}
			if (fenced) return part;
			if (mermaidBlock) {
				if (part.trim() === '') mermaidBlock = false;
				return part;
			}
			if (MERMAID_DECLARATION.test(part.trim())) {
				mermaidBlock = true;
				return part;
			}
			return transformLine(part, Math.floor(index / 2) + 1, findings);
		})
		.join('');

	return {
		source: normalized,
		findings,
		changed: normalized !== source
	};
}
