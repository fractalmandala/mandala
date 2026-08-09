/**
 * Canonical rich-document serialization for FractalKnow.
 *
 * Decision: **Markdown is the source of truth on disk / in Git**, matching
 * OpenKnowledge. TipTap holds an in-memory ProseMirror JSON AST while the
 * user is editing. A bi-directional converter bridges the two layers:
 *
 *   Disk (.md)  ──markdownToTiptapJson──▶  TipTap / ProseMirror JSON AST
 *   Disk (.md)  ◀─tiptapJsonToMarkdown──  TipTap / ProseMirror JSON AST
 *
 * HTML is only an intermediate transport for paste and legacy content, never
 * the durable document format.
 */

import type { Extensions, JSONContent } from '@tiptap/core';
import { marked } from 'marked';

export const CANONICAL_DOCUMENT_FORMAT = 'markdown' as const;

export type CanonicalDocumentFormat = typeof CANONICAL_DOCUMENT_FORMAT;

export type SerializationLayer = {
	/** Durable on-disk representation. */
	disk: CanonicalDocumentFormat;
	/** In-memory editor representation. */
	memory: 'tiptap-json';
	/** Optional intermediate for paste / external HTML. */
	transport?: 'html';
};

export const SERIALIZATION_ARCHITECTURE: SerializationLayer = {
	disk: 'markdown',
	memory: 'tiptap-json',
	transport: 'html',
};

/**
 * The single marked configuration for the whole app. Both the editor bridge
 * and the preview renderer share this instance — divergent `marked.use` calls
 * previously raced on the global marked object (breaks: false vs true), so
 * preview and editor could disagree on the same document.
 */
export const SHARED_MARKED_CONFIG = { gfm: true, breaks: false } as const;

const markdownRenderer = new marked.Renderer();
markdownRenderer.html = ({ text }) => escapeHtml(text);

marked.use({
	...SHARED_MARKED_CONFIG,
	renderer: markdownRenderer,
});

/**
 * Fenced-code info string used to carry YAML frontmatter through the
 * HTML/TipTap layer. Frontmatter has no StarterKit node, so on the load path
 * it is wrapped as a code block with this language; the save path recognizes
 * the language and re-emits raw `---` fences byte-faithfully.
 */
export const FRONTMATTER_LANGUAGE = 'frontmatter';

const FRONTMATTER_PATTERN = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/**
 * Split leading YAML frontmatter from the Markdown body. Returns
 * `frontmatter: null` when the document does not open with a fenced block.
 */
export function splitFrontmatter(markdown: string): {
	frontmatter: string | null;
	body: string;
} {
	const match = FRONTMATTER_PATTERN.exec(markdown);
	if (!match) return { frontmatter: null, body: markdown };
	return { frontmatter: match[1] ?? '', body: markdown.slice(match[0].length) };
}

function frontmatterToHtml(frontmatter: string): string {
	return `<pre><code class="language-${FRONTMATTER_LANGUAGE}">${escapeHtml(frontmatter)}</code></pre>`;
}

/**
 * GFM task-list checkboxes have no StarterKit node, so `<input type="checkbox">`
 * markers are folded to literal `[ ]` / `[x]` text on the load path. The text
 * survives the TipTap schema and re-parses as a task list on the next trip.
 */
function checkboxInputsToText(html: string): string {
	return html.replace(/<input ([^>]*?)type="checkbox"[^>]*>\s?/g, (_match, attrs: string) =>
		attrs.includes('checked') ? '[x] ' : '[ ] ',
	);
}

/**
 * Parse Markdown with the single shared pipeline: the unified marked config,
 * frontmatter extraction, and task-list checkbox folding. Throws on parser
 * errors; callers wanting a fallback should catch (see markdownToEditorHtml).
 */
export function parseSharedMarkdown(markdown: string): string {
	const { frontmatter, body } = splitFrontmatter(markdown);
	const parsed = checkboxInputsToText(marked.parse(body, { async: false }) as string);
	return frontmatter === null ? parsed : `${frontmatterToHtml(frontmatter)}\n${parsed}`;
}

/** Convert canonical Markdown into TipTap-compatible HTML (load path). */
export function markdownToEditorHtml(markdown: string): string {
	const source = markdown?.length ? markdown : '';
	try {
		return parseSharedMarkdown(source);
	} catch {
		return `<p>${escapeHtml(source)}</p>`;
	}
}

/**
 * Convert TipTap HTML back into canonical Markdown (save path).
 * Prefer calling this with `editor.getHTML()` after a TipTap transaction.
 */
export function editorHtmlToMarkdown(html: string): string {
	if (typeof DOMParser === 'undefined') {
		return html
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<\/p>/gi, '\n\n')
			.replace(/<[^>]+>/g, '');
	}

	const document = new DOMParser().parseFromString(html, 'text/html');
	const blocks = Array.from(document.body.childNodes)
		.map((node) => serializeBlock(node).trimEnd())
		.filter(Boolean);

	return blocks.length > 0 ? `${blocks.join('\n\n')}\n` : '';
}

/**
 * Round-trip helper used by tests and mode switches.
 * Markdown → HTML → Markdown should preserve structural content.
 */
export function roundTripMarkdown(markdown: string): string {
	return editorHtmlToMarkdown(markdownToEditorHtml(markdown));
}

/**
 * Build a TipTap JSON document from Markdown using a temporary schema walk
 * through HTML. Callers that already have an Editor should prefer
 * `editor.getJSON()` after `setContent(markdownToEditorHtml(...))`.
 */
export function markdownToTiptapJson(markdown: string): JSONContent {
	if (typeof DOMParser === 'undefined') {
		return {
			type: 'doc',
			content: [{ type: 'paragraph', content: [{ type: 'text', text: markdown }] }],
		};
	}

	const html = markdownToEditorHtml(markdown);
	const document = new DOMParser().parseFromString(html, 'text/html');
	const content = Array.from(document.body.childNodes)
		.map(domNodeToJson)
		.filter((node): node is JSONContent => Boolean(node))
		.filter((node) => !(node.type === 'text' && !(node.text ?? '').trim()));

	return {
		type: 'doc',
		content: content.length > 0 ? content : [{ type: 'paragraph' }],
	};
}

/**
 * Serialize TipTap JSON into canonical Markdown without needing a live editor.
 */
export function tiptapJsonToMarkdown(doc: JSONContent): string {
	if (!doc || doc.type !== 'doc') return '';
	const blocks = (doc.content ?? [])
		.map((node) => jsonBlockToMarkdown(node))
		.filter(Boolean);
	return blocks.length > 0 ? `${blocks.join('\n\n')}\n` : '';
}

export function describeSerializationDecision(): string {
	return [
		'Canonical format: Markdown (.md) on disk and in Git.',
		'In-memory editor state: TipTap / ProseMirror JSON AST.',
		'Bridge: bi-directional Markdown ↔ TipTap conversion (HTML transport only).',
		'Matches OpenKnowledge dual-layer architecture (remark/PM pipeline → simplified local port).',
	].join(' ');
}

function serializeBlock(node: Node): string {
	if (node.nodeType === Node.TEXT_NODE) return markdownEscape(node.textContent ?? '');
	if (!(node instanceof HTMLElement)) return '';

	const tag = node.tagName.toLowerCase();
	if (/^h[1-6]$/.test(tag)) {
		const level = Number(tag.slice(1));
		return `${'#'.repeat(level)} ${serializeInlineChildren(node).trim()}`;
	}
	if (tag === 'p') return serializeInlineChildren(node).trim();
	if (tag === 'blockquote') return serializeBlockquote(node);
	if (tag === 'ul') return serializeList(node, false, '');
	if (tag === 'ol') return serializeList(node, true, '');
	if (tag === 'pre') return serializeCodeBlock(node);
	if (tag === 'hr') return '---';
	if (tag === 'br') return '\n';
	if (tag === 'table') return serializeTable(node);
	return serializeChildren(node);
}

function serializeChildren(node: Node): string {
	return Array.from(node.childNodes)
		.map(serializeBlock)
		.filter((part) => part.trim() !== '')
		.join('\n');
}

/**
 * Serialize a blockquote. Whitespace-only text nodes between child blocks
 * (marked emits `<blockquote>\n<p>…`) previously became empty `> ` lines.
 * Paragraph children are separated by a bare `>` line so they re-parse as
 * distinct paragraphs; nested blockquotes need no separator (their own `>`
 * prefix already breaks the continuation).
 */
function serializeBlockquote(node: HTMLElement): string {
	const parts = Array.from(node.childNodes)
		.map(serializeBlock)
		.filter((part) => part.trim() !== '');
	const lines = parts.flatMap((part, index) =>
		index === 0 || part.startsWith('>') ? part.split('\n') : ['', ...part.split('\n')],
	);
	return lines.map((line) => (line.trim() ? `> ${line}` : '>')).join('\n');
}

function serializeInlineChildren(node: Node): string {
	return Array.from(node.childNodes).map(serializeInline).join('');
}

function serializeInline(node: Node): string {
	if (node.nodeType === Node.TEXT_NODE) return markdownEscape(node.textContent ?? '');
	if (!(node instanceof HTMLElement)) return '';

	const tag = node.tagName.toLowerCase();
	const content = serializeInlineChildren(node);
	if (tag === 'strong' || tag === 'b') return `**${content}**`;
	if (tag === 'em' || tag === 'i') return `_${content}_`;
	if (tag === 's' || tag === 'del' || tag === 'strike') return `~~${content}~~`;
	if (tag === 'code') {
		// Inline code must not be escaped; fence with double backticks when the
		// code itself contains a backtick. Newlines cannot appear inside inline
		// code spans — collapse them to spaces so serialization stays stable.
		const raw = (node.textContent ?? '').replaceAll('\n', ' ');
		return raw.includes('`') ? `\`\` ${raw} \`\`` : `\`${raw}\``;
	}
	if (tag === 'a') {
		const href = node.getAttribute('href');
		return href ? `[${content}](${href})` : content;
	}
	if (tag === 'img') {
		const alt = node.getAttribute('alt') ?? '';
		const src = node.getAttribute('src') ?? '';
		return src ? `![${alt}](${src})` : alt;
	}
	if (tag === 'br') return '\n';
	return content || serializeBlock(node);
}

function serializeList(node: HTMLElement, ordered: boolean, indent: string): string {
	return Array.from(node.children)
		.filter((child) => child.tagName.toLowerCase() === 'li')
		.map((child, index) => {
			const marker = ordered ? `${index + 1}.` : '-';
			// Nested content must indent past the parent marker width or the next
			// parse de-nests it (2 spaces is not enough under a `1. ` marker).
			const childIndent = `${indent}${' '.repeat(marker.length + 1)}`;
			const nestedLists = Array.from(child.children).filter((el) =>
				['ul', 'ol'].includes(el.tagName.toLowerCase()),
			) as HTMLElement[];
			const inlineParts = unescapeTaskMarker(
				Array.from(child.childNodes)
					.filter((n) => !(n instanceof HTMLElement && ['ul', 'ol'].includes(n.tagName.toLowerCase())))
					.map(serializeInline)
					.join('')
					.trim(),
			);
			const nested = nestedLists
				.map((list) => serializeList(list, list.tagName.toLowerCase() === 'ol', childIndent))
				.filter(Boolean)
				.join('\n');
			return nested
				? `${indent}${marker} ${inlineParts}\n${nested}`
				: `${indent}${marker} ${inlineParts}`;
		})
		.join('\n');
}

function serializeCodeBlock(node: HTMLElement): string {
	const codeEl = node.querySelector('code');
	const language =
		Array.from(codeEl?.classList ?? [])
			.find((cls) => cls.startsWith('language-'))
			?.replace('language-', '') ?? '';
	const code = (codeEl?.textContent ?? node.textContent ?? '').replace(/\n$/, '');
	if (language === FRONTMATTER_LANGUAGE) {
		// Re-emit raw YAML fences so frontmatter survives byte-faithfully.
		return `---\n${code}\n---`;
	}
	return `\`\`\`${language}\n${code}\n\`\`\``;
}

function serializeTable(node: HTMLElement): string {
	const rows = Array.from(node.querySelectorAll('tr'));
	if (rows.length === 0) return '';
	const matrix = rows.map((row) =>
		Array.from(row.querySelectorAll('th,td')).map((cell) => serializeInlineChildren(cell).trim()),
	);
	const header = matrix[0] ?? [];
	const separator = header.map(() => '---');
	const lines = [
		`| ${header.join(' | ')} |`,
		`| ${separator.join(' | ')} |`,
		...matrix.slice(1).map((row) => `| ${row.join(' | ')} |`),
	];
	return lines.join('\n');
}

function domNodeToJson(node: Node): JSONContent | null {
	if (node.nodeType === Node.TEXT_NODE) {
		const text = node.textContent ?? '';
		return text ? { type: 'text', text } : null;
	}
	if (!(node instanceof HTMLElement)) return null;

	const tag = node.tagName.toLowerCase();
	if (/^h[1-6]$/.test(tag)) {
		return {
			type: 'heading',
			attrs: { level: Number(tag.slice(1)) },
			content: inlineJsonChildren(node),
		};
	}
	if (tag === 'p') return { type: 'paragraph', content: inlineJsonChildren(node) };
	if (tag === 'blockquote') {
		return {
			type: 'blockquote',
			content: Array.from(node.childNodes)
				.map(domNodeToJson)
				.filter((n): n is JSONContent => Boolean(n)),
		};
	}
	if (tag === 'ul') return { type: 'bulletList', content: listItemJson(node) };
	if (tag === 'ol') return { type: 'orderedList', content: listItemJson(node) };
	if (tag === 'pre') {
		const code = node.querySelector('code');
		const language =
			Array.from(code?.classList ?? [])
				.find((cls) => cls.startsWith('language-'))
				?.replace('language-', '') ?? null;
		return {
			type: 'codeBlock',
			attrs: { language },
			content: code?.textContent ? [{ type: 'text', text: code.textContent }] : [],
		};
	}
	if (tag === 'hr') return { type: 'horizontalRule' };
	if (tag === 'br') return { type: 'hardBreak' };
	return {
		type: 'paragraph',
		content: inlineJsonChildren(node),
	};
}

function listItemJson(list: HTMLElement): JSONContent[] {
	return Array.from(list.children)
		.filter((child) => child.tagName.toLowerCase() === 'li')
		.map((li) => {
			const content: JSONContent[] = [];
			const paragraphBits: Node[] = [];
			for (const child of Array.from(li.childNodes)) {
				if (child instanceof HTMLElement && ['ul', 'ol'].includes(child.tagName.toLowerCase())) {
					if (paragraphBits.length > 0) {
						content.push({
							type: 'paragraph',
							content: paragraphBits
								.map(inlineNodeToJson)
								.filter((n): n is JSONContent => Boolean(n)),
						});
						paragraphBits.length = 0;
					}
					const nested = domNodeToJson(child);
					if (nested) content.push(nested);
				} else if (child.nodeType === Node.TEXT_NODE && !(child.textContent ?? '').trim()) {
					// Whitespace-only nodes between blocks must not become
					// spurious paragraphs in the JSON AST.
					continue;
				} else {
					paragraphBits.push(child);
				}
			}
			if (paragraphBits.length > 0 || content.length === 0) {
				content.unshift({
					type: 'paragraph',
					content: paragraphBits
						.map(inlineNodeToJson)
						.filter((n): n is JSONContent => Boolean(n)),
				});
			}
			return { type: 'listItem', content };
		});
}

function inlineJsonChildren(node: Node): JSONContent[] {
	return Array.from(node.childNodes)
		.map(inlineNodeToJson)
		.filter((n): n is JSONContent => Boolean(n));
}

function inlineNodeToJson(node: Node): JSONContent | null {
	if (node.nodeType === Node.TEXT_NODE) {
		const text = node.textContent ?? '';
		return text ? { type: 'text', text } : null;
	}
	if (!(node instanceof HTMLElement)) return null;
	const tag = node.tagName.toLowerCase();
	const children = inlineJsonChildren(node);
	if (tag === 'strong' || tag === 'b') return wrapMarks(children, { type: 'bold' });
	if (tag === 'em' || tag === 'i') return wrapMarks(children, { type: 'italic' });
	if (tag === 's' || tag === 'del') return wrapMarks(children, { type: 'strike' });
	if (tag === 'code') return wrapMarks(children, { type: 'code' });
	if (tag === 'a') {
		const href = node.getAttribute('href') ?? '';
		return wrapMarks(children, { type: 'link', attrs: { href, target: '_blank' } });
	}
	if (tag === 'br') return { type: 'hardBreak' };
	if (children.length === 1) return children[0] ?? null;
	return children[0] ?? null;
}

function wrapMarks(nodes: JSONContent[], mark: { type: string; attrs?: Record<string, unknown> }): JSONContent {
	if (nodes.length === 0) return { type: 'text', text: '', marks: [mark] };
	if (nodes.length === 1 && nodes[0]?.type === 'text') {
		return {
			...nodes[0],
			marks: [...(nodes[0].marks ?? []), mark],
		};
	}
	return {
		type: 'text',
		text: nodes.map((n) => n.text ?? '').join(''),
		marks: [mark],
	};
}

function jsonBlockToMarkdown(node: JSONContent): string {
	switch (node.type) {
		case 'heading': {
			const level = Number(node.attrs?.level ?? 1);
			return `${'#'.repeat(level)} ${jsonInlinesToMarkdown(node.content ?? [])}`;
		}
		case 'paragraph':
			return jsonInlinesToMarkdown(node.content ?? []);
		case 'blockquote': {
			const parts = (node.content ?? [])
				.map(jsonBlockToMarkdown)
				.filter((part) => part.trim() !== '');
			const lines = parts.flatMap((part, index) =>
				index === 0 || part.startsWith('>') ? part.split('\n') : ['', ...part.split('\n')],
			);
			return lines.map((line) => (line.trim() ? `> ${line}` : '>')).join('\n');
		}
		case 'bulletList':
			return (node.content ?? [])
				.map((item) => listItemToMarkdown(item, false, ''))
				.join('\n');
		case 'orderedList':
			return (node.content ?? [])
				.map((item, index) => listItemToMarkdown(item, true, '', index + 1))
				.join('\n');
		case 'codeBlock': {
			const language = (node.attrs?.language as string | null) ?? '';
			const code = (node.content ?? []).map((c) => c.text ?? '').join('').replace(/\n$/, '');
			if (language === FRONTMATTER_LANGUAGE) {
				return `---\n${code}\n---`;
			}
			return `\`\`\`${language}\n${code}\n\`\`\``;
		}
		case 'horizontalRule':
			return '---';
		case 'hardBreak':
			return '\n';
		default:
			return jsonInlinesToMarkdown(node.content ?? []);
	}
}

function listItemToMarkdown(
	item: JSONContent,
	ordered: boolean,
	indent: string,
	index = 1,
): string {
	const marker = ordered ? `${index}.` : '-';
	const childIndent = `${indent}${' '.repeat(marker.length + 1)}`;
	const blocks = item.content ?? [];
	const first = blocks[0];
	const firstLine = unescapeTaskMarker(
		first?.type === 'paragraph'
			? jsonInlinesToMarkdown(first.content ?? [])
			: jsonBlockToMarkdown(first ?? { type: 'paragraph' }),
	);
	const rest = blocks
		.slice(1)
		.map((block) => {
			if (block.type === 'bulletList') {
				return (block.content ?? [])
					.map((child) => listItemToMarkdown(child, false, childIndent))
					.join('\n');
			}
			if (block.type === 'orderedList') {
				return (block.content ?? [])
					.map((child, i) => listItemToMarkdown(child, true, childIndent, i + 1))
					.join('\n');
			}
			return `${childIndent}${jsonBlockToMarkdown(block)}`;
		})
		.filter(Boolean)
		.join('\n');
	return rest ? `${indent}${marker} ${firstLine}\n${rest}` : `${indent}${marker} ${firstLine}`;
}

function jsonInlinesToMarkdown(nodes: JSONContent[]): string {
	return nodes
		.map((node) => {
			if (node.type === 'hardBreak') return '\n';
			if (node.type !== 'text') return jsonInlinesToMarkdown(node.content ?? []);
			const marks = node.marks ?? [];
			const hasCodeMark = marks.some((mark) => mark.type === 'code');
			// Code spans keep their literal text; everything else must be
			// escaped so markdown punctuation survives the next parse. Newlines
			// cannot appear inside code spans — collapse them to spaces.
			let text = hasCodeMark
				? (node.text ?? '').replaceAll('\n', ' ')
				: markdownEscape(node.text ?? '');
			for (const mark of marks) {
				if (mark.type === 'bold') text = `**${text}**`;
				if (mark.type === 'italic') text = `_${text}_`;
				if (mark.type === 'strike') text = `~~${text}~~`;
				if (mark.type === 'code') text = text.includes('`') ? `\`\` ${text} \`\`` : `\`${text}\``;
				if (mark.type === 'link') {
					const href = (mark.attrs?.href as string | undefined) ?? '';
					text = href ? `[${text}](${href})` : text;
				}
			}
			return text;
		})
		.join('');
}

function markdownEscape(value: string): string {
	// Escape anything that would be reinterpreted as markdown syntax on the
	// next parse. Without this, `\*stars\*` comes back as `*stars*` and turns
	// italic on the following trip (data corruption).
	return value
		.replaceAll('\\', '\\\\')
		.replaceAll('*', '\\*')
		.replaceAll('_', '\\_')
		.replaceAll('`', '\\`')
		.replaceAll('[', '\\[')
		.replaceAll(']', '\\]');
}

/**
 * Restore a GFM task marker at the start of a list item. Checkbox state rides
 * the editor as literal `[ ]` / `[x]` text; the bracket escaping that protects
 * regular text would otherwise prevent re-parsing as a task list.
 */
function unescapeTaskMarker(text: string): string {
	return text.replace(/^\\\[([ xX])\\\] /, '[$1] ');
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

/** Shared TipTap extension bundle used for serialization-aware editor creation. */
export type { Extensions };
