// Lightweight, robust Markdown to HTML renderer for vault documents
export function renderMarkdownToHtml(markdown: string): string {
	if (!markdown) return '';

	let html = markdown;

	// 1. Escape basic HTML tags to prevent XSS except inside code
	// 2. Fenced code blocks
	const codeBlocks: string[] = [];
	html = html.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
		const escapedCode = code
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		const blockHtml = `<pre class="code-block lang-${lang}"><code>${escapedCode}</code></pre>`;
		codeBlocks.push(blockHtml);
		return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
	});

	// Inline code spans
	const inlineCodes: string[] = [];
	html = html.replace(/`([^`]+)`/g, (_, code) => {
		const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		inlineCodes.push(`<code class="inline-code">${escapedCode}</code>`);
		return `__INLINE_CODE_${inlineCodes.length - 1}__`;
	});

	// Headings with IDs
	html = html.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, text) => {
		const level = hashes.length;
		const cleanText = text.replace(/\*|_/g, '').trim();
		const id = cleanText
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-');
		return `<h${level} id="${id}" class="doc-heading level-${level}">${cleanText}</h${level}>`;
	});

	// Blockquotes
	html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="doc-quote">$1</blockquote>');

	// Unordered lists
	html = html.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li class="doc-list-item">$1</li>');
	html = html.replace(/(<li class="doc-list-item">.*<\/li>\n?)+/g, '<ul class="doc-list">$&</ul>');

	// Ordered lists
	html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li class="doc-list-item">$1</li>');

	// Tables (basic GFM table support)
	html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
		const cells = content.split('|').map((c: string) => c.trim());
		if (cells.every((c: string) => /^:?-+:?$/.test(c))) {
			return '__TABLE_HEADER_SEP__';
		}
		const cellTags = cells.map((c: string) => `<td>${c}</td>`).join('');
		return `<tr>${cellTags}</tr>`;
	});
	html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (tableMatch) => {
		const rows = tableMatch.split('\n').filter(Boolean);
		if (rows.length > 0 && rows[1] === '__TABLE_HEADER_SEP__') {
			const headerRow = rows[0].replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');
			const bodyRows = rows.slice(2).join('\n');
			return `<table class="doc-table"><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
		}
		return `<table class="doc-table"><tbody>${tableMatch}</tbody></table>`;
	});
	html = html.replace(/__TABLE_HEADER_SEP__\n?/g, '');

	// Horizontal rules
	html = html.replace(/^---$/gm, '<hr class="doc-hr" />');

	// Links: [Text](url)
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="doc-link">$1</a>');

	// Bold and Italic
	html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

	// Paragraphs
	const paragraphs = html.split(/\n\n+/);
	html = paragraphs
		.map((p) => {
			const trimmed = p.trim();
			if (!trimmed) return '';
			if (/^<(h[1-6]|ul|ol|li|blockquote|pre|table|hr)/.test(trimmed)) {
				return trimmed;
			}
			return `<p class="doc-p">${trimmed}</p>`;
		})
		.join('\n');

	// Restore inline code spans
	html = html.replace(/__INLINE_CODE_(\d+)__/g, (_, idx) => inlineCodes[parseInt(idx, 10)]);

	// Restore code blocks
	html = html.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[parseInt(idx, 10)]);

	return html;
}
