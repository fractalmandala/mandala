const blockedElements = /<(script|style|svelte:[a-z-]+)\b[^>]*>[\s\S]*?<\/\1>/gi;
const blockedVoidElements = /<\/?(script|style|svelte:[a-z-]+)\b[^>]*>/gi;

function escapeExpressionBraces(line: string): string {
	let result = '';
	let inCodeSpan = false;

	for (let index = 0; index < line.length; index += 1) {
		const character = line[index];

		if (character === '`') {
			inCodeSpan = !inCodeSpan;
			result += character;
			continue;
		}
		if (!inCodeSpan && character === '{') {
			result += '&#123;';
			continue;
		}
		if (!inCodeSpan && character === '}') {
			result += '&#125;';
			continue;
		}

		result += character;
	}

	return result;
}

/**
 * Makes untrusted Markdown safe to compile as documentation content.
 *
 * Remote documents are content, never application modules: embedded scripts and Svelte
 * elements are removed, and expression braces outside code are escaped so mdsvex cannot
 * evaluate anything the upstream system supplied.
 */
export function sanitizeRemoteMarkdown(content: string): string {
	const withoutBlockedElements = content
		.replace(/\r\n/g, '\n')
		.replace(blockedElements, '')
		.replace(blockedVoidElements, '');
	const lines = withoutBlockedElements.split('\n');
	let fenceMarker: string | undefined;

	return lines
		.map((line) => {
			const fence = /^\s{0,3}(`{3,}|~{3,})/.exec(line);

			if (fenceMarker === undefined && fence?.[1]) {
				fenceMarker = fence[1][0];
				return line;
			}
			if (fenceMarker !== undefined) {
				if (fence?.[1]?.startsWith(fenceMarker)) {
					fenceMarker = undefined;
				}
				return line;
			}

			return escapeExpressionBraces(line);
		})
		.join('\n');
}

/** Remote documents are always Markdown; mdsvex sources would be executable modules. */
export function toMarkdownPath(path: string): string {
	return `${path.replace(/\.(md|svx|markdown|mdx)$/i, '')}.md`;
}
