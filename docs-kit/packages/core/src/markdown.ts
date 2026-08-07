/** A heading extracted from a documentation source. */
export interface DocsHeading {
	id: string;
	text: string;
	depth: 1 | 2 | 3 | 4 | 5 | 6;
	/** 1-based line number of the heading in the source. */
	line: number;
}

/** A body section: everything from one heading up to the next of equal or lower depth. */
export interface DocsSection {
	heading?: DocsHeading;
	/** Ancestor heading texts, outermost first. */
	path: string[];
	content: string;
	startLine: number;
	endLine: number;
}

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Splits YAML frontmatter from the Markdown body without evaluating the document. */
export function splitDocsFrontmatter(source: string): { frontmatter: string; body: string } {
	const match = frontmatterPattern.exec(source);
	if (!match) {
		return { frontmatter: '', body: source };
	}

	return { frontmatter: match[1] ?? '', body: source.slice(match[0].length) };
}

/** Converts heading text into a stable anchor id. */
export function slugifyHeading(text: string): string {
	return (
		text
			.toLowerCase()
			.replace(/`([^`]*)`/g, '$1')
			.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
			.replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
			.trim()
			.replace(/\s+/g, '-') || 'section'
	);
}

/** Appends a numeric suffix so repeated headings never share an anchor. */
function uniqueId(candidate: string, used: Set<string>): string {
	if (!used.has(candidate)) {
		used.add(candidate);
		return candidate;
	}

	let counter = 1;
	let id = `${candidate}-${counter}`;
	while (used.has(id)) {
		counter += 1;
		id = `${candidate}-${counter}`;
	}
	used.add(id);
	return id;
}

interface HeadingScanResult {
	headings: DocsHeading[];
	lines: string[];
	bodyOffset: number;
}

function scanHeadings(body: string): HeadingScanResult {
	const lines = body.split('\n');
	const headings: DocsHeading[] = [];
	const used = new Set<string>();
	let fenceMarker: string | undefined;

	lines.forEach((line, index) => {
		const fence = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
		if (fence?.[1]) {
			const marker = fence[1][0] as string;
			if (fenceMarker === undefined) {
				fenceMarker = marker;
			} else if (marker === fenceMarker) {
				fenceMarker = undefined;
			}
			return;
		}
		if (fenceMarker !== undefined) {
			return;
		}

		const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
		if (!heading?.[1] || !heading[2]) {
			return;
		}

		const text = heading[2].trim();
		headings.push({
			id: uniqueId(slugifyHeading(text), used),
			text,
			depth: heading[1].length as DocsHeading['depth'],
			line: index + 1
		});
	});

	return { headings, lines, bodyOffset: 0 };
}

/** Extracts ATX headings, ignoring anything inside fenced code blocks. */
export function extractDocsHeadings(source: string): DocsHeading[] {
	return scanHeadings(splitDocsFrontmatter(source).body).headings;
}

/** Returns the first level-one heading, which is the conventional page title. */
export function extractDocsTitle(source: string): string | undefined {
	return extractDocsHeadings(source).find((heading) => heading.depth === 1)?.text;
}

/**
 * Splits a document into heading-scoped sections.
 * Content before the first heading becomes a leading section with no heading.
 */
export function splitDocsSections(source: string): DocsSection[] {
	const { body } = splitDocsFrontmatter(source);
	const { headings, lines } = scanHeadings(body);
	const sections: DocsSection[] = [];
	const stack: DocsHeading[] = [];

	const pushSection = (
		heading: DocsHeading | undefined,
		path: string[],
		startLine: number,
		endLine: number
	): void => {
		const content = lines.slice(startLine - 1, endLine).join('\n').trim();
		if (content === '' && heading === undefined) {
			return;
		}

		sections.push({
			...(heading === undefined ? {} : { heading }),
			path,
			content,
			startLine,
			endLine
		});
	};

	if (headings.length === 0) {
		pushSection(undefined, [], 1, lines.length);
		return sections;
	}

	const first = headings[0] as DocsHeading;
	if (first.line > 1) {
		pushSection(undefined, [], 1, first.line - 1);
	}

	headings.forEach((heading, index) => {
		while (stack.length > 0 && (stack.at(-1) as DocsHeading).depth >= heading.depth) {
			stack.pop();
		}

		const path = stack.map((entry) => entry.text);
		const next = headings[index + 1];
		pushSection(heading, path, heading.line, next ? next.line - 1 : lines.length);
		stack.push(heading);
	});

	return sections;
}

/** A link or asset reference found in a document. */
export interface DocsLink {
	/** Raw target as written, before resolution. */
	href: string;
	/** Link text, or the image's alt text. */
	text: string;
	kind: 'link' | 'image';
	/** 1-based line number in the source. */
	line: number;
}

const linkPattern = /(!?)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const htmlLinkPattern = /<(a|img)\b[^>]*?(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi;

/**
 * Extracts Markdown and HTML links and images, skipping fenced code.
 *
 * Validation uses this to check internal links and anchors, so what it reports matches
 * what a reader can actually click.
 */
export function extractDocsLinks(source: string): DocsLink[] {
	const { body } = splitDocsFrontmatter(source);
	const offset = source.slice(0, source.length - body.length).split('\n').length - 1;
	const lines = body.split('\n');
	const links: DocsLink[] = [];
	let fenceMarker: string | undefined;

	lines.forEach((line, index) => {
		const fence = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1]?.[0];
		if (fence) {
			fenceMarker = fenceMarker === undefined ? fence : fenceMarker === fence ? undefined : fenceMarker;
			return;
		}
		if (fenceMarker !== undefined) {
			return;
		}

		for (const match of line.matchAll(linkPattern)) {
			links.push({
				href: match[3] ?? '',
				text: match[2] ?? '',
				kind: match[1] === '!' ? 'image' : 'link',
				line: offset + index + 1
			});
		}

		for (const match of line.matchAll(htmlLinkPattern)) {
			links.push({
				href: match[2] ?? match[3] ?? '',
				text: '',
				kind: (match[1] ?? '').toLowerCase() === 'img' ? 'image' : 'link',
				line: offset + index + 1
			});
		}
	});

	return links;
}
