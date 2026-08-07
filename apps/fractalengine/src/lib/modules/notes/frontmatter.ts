export interface FrontmatterDisplay {
	title?: string;
	description?: string;
	tags?: string[];
}

export interface ParsedFrontmatter {
	frontmatter: FrontmatterDisplay | null;
	body: string;
	prefix: string;
}

export function parseFrontmatter(md: string): ParsedFrontmatter {
	const opening = md.match(/^---(?:\r?\n)/);
	if (!opening) return { frontmatter: null, body: md, prefix: '' };
	const contentStart = opening[0].length;
	const closing = /(?:^|\r?\n)---(?:\r?\n|$)/gm;
	closing.lastIndex = contentStart;
	const match = closing.exec(md);
	if (!match) return { frontmatter: null, body: md, prefix: '' };
	const leadingNewline = match[0].match(/^\r?\n/)?.[0].length ?? 0;
	const delimiterStart = match.index + leadingNewline;
	const delimiterEnd = match.index + match[0].length;
	const yamlBlock = md.slice(contentStart, delimiterStart).trim();
	const frontmatter: FrontmatterDisplay = {};
	let currentListKey: string | null = null;

	for (const line of yamlBlock.split('\n')) {
		const trimmedLine = line.trim();
		if (trimmedLine.startsWith('- ') && currentListKey === 'tags') {
			const tag = trimmedLine.slice(2).trim();
			if (tag) (frontmatter.tags ??= []).push(tag);
			continue;
		}
		currentListKey = null;
		const colonIndex = trimmedLine.indexOf(':');
		if (colonIndex === -1) continue;
		const key = trimmedLine.slice(0, colonIndex).trim();
		let value = trimmedLine.slice(colonIndex + 1).trim();
		if (!value && key === 'tags') {
			currentListKey = 'tags';
			continue;
		}
		if (!value) continue;
		if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
		if ((key === 'title' || key === 'name') && !frontmatter.title) frontmatter.title = value;
		else if (['description', 'summary', 'about', 'excerpt'].includes(key) && !frontmatter.description) frontmatter.description = value;
		else if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
			frontmatter.tags = value.slice(1, -1).split(',').map((tag) => tag.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
		}
	}

	const hasDisplayData = Boolean(frontmatter.title || frontmatter.description || frontmatter.tags?.length);
	return {
		frontmatter: hasDisplayData ? frontmatter : null,
		body: md.slice(delimiterEnd),
		prefix: md.slice(0, delimiterEnd),
	};
}
