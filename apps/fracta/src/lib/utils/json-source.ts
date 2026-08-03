function escapeHtml(value: string) {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/**
 * Produces the non-interactive token layer behind the JSON source textarea.
 * Every non-token segment is escaped so malformed JSON can never become markup.
 */
export function highlightJsonSource(source: string) {
	const token = /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
	let result = '';
	let cursor = 0;

	for (const match of source.matchAll(token)) {
		const index = match.index ?? 0;
		result += escapeHtml(source.slice(cursor, index));
		const kind = match[1] ? 'key' : match[2] ? 'string' : match[3] ? 'literal' : 'number';
		result += `<span class="json-source__${kind}">${escapeHtml(match[0])}</span>`;
		cursor = index + match[0].length;
	}

	return result + escapeHtml(source.slice(cursor));
}
