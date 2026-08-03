import { marked } from 'marked';
import TurndownService from 'turndown';

// Markdown is the source of truth on disk; the editor works in HTML. These two
// functions are the only bridge between the two representations.

marked.setOptions({
	gfm: true,
	breaks: false
});

const turndown = new TurndownService({
	headingStyle: 'atx',
	bulletListMarker: '-',
	codeBlockStyle: 'fenced',
	emDelimiter: '_'
});

export interface MarkdownFrontmatter {
	fields: Record<string, string>;
	body: string;
}

export interface MarkdownDocumentParts extends MarkdownFrontmatter {
	prefix: string;
}

/** A deliberately small YAML-frontmatter reader for presentation. It never rewrites
 * source and leaves non-scalar YAML to the source editor. */
export function splitFrontmatter(markdown: string): MarkdownFrontmatter {
	const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { fields: {}, body: markdown };
	const fields: Record<string, string> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const field = line.match(/^([A-Za-z][\w-]*):\s*(.+)$/);
		if (field) fields[field[1]] = field[2].replace(/^['"]|['"]$/g, '');
	}
	return { fields, body: markdown.slice(match[0].length) };
}

/** The rich editor deliberately keeps YAML outside of ProseMirror. YAML can carry
 * nested values and comments that a presentation parser must never rewrite. */
export function splitMarkdownDocument(markdown: string): MarkdownDocumentParts {
	const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	const parsed = splitFrontmatter(markdown);
	return { ...parsed, prefix: match?.[0] ?? '' };
}

// Preserve strikethrough, which turndown drops by default.
turndown.addRule('strikethrough', {
	filter: ['del', 's'],
	replacement: (content) => `~~${content}~~`
});

// Tiptap's task nodes use data attributes while ordinary Markdown uses checkbox
// inputs. Keep the disk format ordinary GFM in both directions.
turndown.addRule('task-item', {
	filter: (node) => node.nodeName === 'LI' && (node as HTMLElement).dataset.type === 'taskItem',
	replacement: (content, node) => {
		const checked = (node as HTMLElement).dataset.checked === 'true';
		return `- [${checked ? 'x' : ' '}] ${content.trim()}\n`;
	}
});

// Turndown intentionally treats tables as HTML. Fracta persists a small, portable
// GFM table instead so its table editor round-trips with other Markdown tools.
turndown.addRule('gfm-table', {
	filter: 'table',
	replacement: (_content, node) => {
		const rows = Array.from((node as HTMLElement).querySelectorAll('tr'));
		if (!rows.length) return '';
		const cells = (row: Element) => Array.from(row.querySelectorAll(':scope > th, :scope > td')).map((cell) =>
			(cell.textContent ?? '').trim().replaceAll('|', '\\|').replaceAll('\n', ' ')
		);
		const header = cells(rows[0]);
		if (!header.length) return '';
		const body = rows.slice(1).map((row) => `| ${cells(row).join(' | ')} |`).join('\n');
		return `\n\n| ${header.join(' | ')} |\n| ${header.map(() => '---').join(' | ')} |${body ? `\n${body}` : ''}\n\n`;
	}
});

// Fracta extensions are intentionally stored as readable Markdown text rather
// than editor-only document nodes. In the rich editor they become protected
// source chips; this prevents a routine prose edit from flattening their
// whitespace or escaping their wiki/footnote syntax on save.
turndown.addRule('fracta-source', {
	filter: (node) => node.nodeType === 1 && node.getAttribute('data-fracta-source') !== null,
	replacement: (_content, node) => node.getAttribute('data-fracta-source') ?? ''
});

/** Markdown → HTML. Display-only Fracta syntax is opt-in so the rich editor
 * never consumes portable source constructs it cannot round-trip. */
export function markdownToHtml(markdown: string, presentation = false): string {
	return renderMarkdown(markdown, presentation, true);
}

function renderMarkdown(markdown: string, presentation: boolean, escapeHtml: boolean): string {
	const source = escapeHtml ? escapeRawHtml(markdown) : markdown;
	const html = marked.parse(presentation ? prepareFractaSyntax(source) : source, { async: false });
	return html.replace(/<ul>\n((?:<li><input type="checkbox"[^>]*>.*?<\/li>\n?)+)<\/ul>/gs, (_list, items) => {
		const taskItems = items.replace(/<li><input type="checkbox"([^>]*)>(.*?)<\/li>/gs, (_item: string, attributes: string, body: string) => {
			const checked = /checked/.test(attributes) ? ' data-checked="true"' : '';
			return `<li data-type="taskItem"${checked}><label><input type="checkbox"${checked ? ' checked' : ''}></label><div>${body}</div></li>`;
		});
		return `<ul data-type="taskList">${taskItems}</ul>`;
	});
}

/** Markdown → HTML for the WYSIWYG editor. Source-owned Fracta extensions are
 * rendered as protected code-like blocks or inline chips and restored verbatim
 * by `htmlToMarkdown`. Standard Markdown remains fully editable. */
export function markdownToEditorHtml(markdown: string): string {
	return renderMarkdown(protectFractaEditorSource(escapeRawHtml(markdown)), false, false);
}

/** Markdown documents are data, not executable WebView markup. Raw HTML stays
 * visible as literal source; Fracta's own preview elements are generated only
 * after this pass. Fenced code is already literal and is left untouched. */
function escapeRawHtml(markdown: string): string {
	return markdown.split(/(```[\s\S]*?```)/g).map((part, index) => index % 2 ? part : part.replaceAll('<', '&lt;').replaceAll('>', '&gt;')).join('');
}

function protectFractaEditorSource(markdown: string): string {
	const protectedBlocks: string[] = [];
	const stash = (source: string, block = false) => {
		const index = protectedBlocks.push(source) - 1;
		return block
			? `\n\n<pre data-fracta-source-index="${index}" data-fracta-source="${escapeAttribute(source)}"><code>${escapeHtml(source)}</code></pre>\n\n`
			: `<span data-fracta-source-index="${index}" data-fracta-source="${escapeAttribute(source)}">${escapeHtml(source)}</span>`;
	};
	let protectedMarkdown = markdown
		.replace(/^:::(?:tabs|accordion)[^\n]*\r?\n[\s\S]*?^:::\s*$/gm, (source) => stash(source.trimEnd(), true))
		.replace(/^\[\^[^\]\n]+\]:.*$/gm, (source) => stash(source));
	// Never reinterpret examples in fenced code. The fence itself remains an
	// ordinary editable code block, which already round-trips through Tiptap.
	return protectedMarkdown.split(/(```[\s\S]*?```)/g).map((part, index) => index % 2 ? part : part
		.replace(/!?(?:\[\[[^\]\n]+\]\])/g, (source) => stash(source))
		.replace(/\[\^[^\]\n]+\]/g, (source) => stash(source))
	).join('');
}

/** Gives portable Fracta wiki syntax semantic hooks in previews. Fenced code is
 * protected so documentation examples remain literal source. */
function prepareFractaSyntax(markdown: string): string {
	const definitions = new Map<string, string>();
	const withoutDefinitions = markdown.replace(/^\[\^([^\]\n]+)\]:\s*(.+)$/gm, (_match, id: string, text: string) => {
		definitions.set(id, text.trim());
		return '';
	});
	const referenced: string[] = [];
	const rendered = withoutDefinitions.split(/(```[\s\S]*?```)/g).map((part, index) => index % 2 ? part : renderInteractiveBlocks(part)
		.replace(/!\[\[([^\]\n]+)\]\]/g, (_match, source: string) => {
			const [rawPath, rawLabel] = source.split('|', 2);
			const path = rawPath.trim();
			const label = (rawLabel ?? path).trim();
			const media = /\.(?:mp3|m4a|wav|ogg|oga|flac|mp4|m4v|webm|ogv|mov)$/i.test(path);
			if (media) {
				const tag = /\.(?:mp3|m4a|wav|ogg|oga|flac)$/i.test(path) ? 'audio' : 'video';
				return `<figure class="fracta-media fracta-media--${tag}"><${tag} controls preload="metadata" data-fracta-media-path="${escapeAttribute(path)}" aria-label="${escapeAttribute(label)}"></${tag}><figcaption>${escapeHtml(label)}</figcaption></figure>`;
			}
			const type = /\.(?:pdf|docx|csv|tsv|json|txt)$/i.test(path) ? 'attachment' : 'transclusion';
			if (type === 'attachment') {
				return `<section class="fracta-attachment"><button type="button" class="fracta-attachment__open" data-fracta-path="${escapeAttribute(path)}" aria-label="Open attachment ${escapeAttribute(label)}">${escapeHtml(label)}</button></section>`;
			}
			return `<section class="fracta-transclusion" data-fracta-path="${escapeAttribute(path)}"><span>${escapeHtml(label)}</span></section>`;
		})
		.replace(/(?<!!)\[\[([^\]\n]+)\]\]/g, (_match, source: string) => {
			const [rawPath, rawLabel] = source.split('|', 2);
			const path = rawPath.trim();
			return `<a class="fracta-wikilink" href="#${encodeURIComponent(path)}" data-fracta-path="${escapeAttribute(path)}">${escapeHtml((rawLabel ?? path).trim())}</a>`;
		})
		.replace(/\[\^([^\]\n]+)\]/g, (_match, id: string) => {
			if (!definitions.has(id)) return _match;
			if (!referenced.includes(id)) referenced.push(id);
			const number = referenced.indexOf(id) + 1;
			return `<sup class="fracta-footnote-ref"><a href="#fracta-footnote-${encodeURIComponent(id)}" id="fracta-footnote-ref-${encodeURIComponent(id)}" aria-label="Footnote ${number}">${number}</a></sup>`;
		})).join('');
	if (!referenced.length) return rendered;
	const notes = referenced.map((id, index) => `<li id="fracta-footnote-${encodeURIComponent(id)}">${escapeHtml(definitions.get(id) ?? '')} <a href="#fracta-footnote-ref-${encodeURIComponent(id)}" aria-label="Back to footnote reference ${index + 1}">↩</a></li>`).join('');
	return `${rendered}\n<section class="fracta-footnotes" aria-label="Footnotes"><ol>${notes}</ol></section>`;
}

/** Preview-only blocks. They intentionally use a small source grammar rather
 * than proprietary document state: `:::accordion Title` and `:::tabs` / `::tab`
 * remain understandable, editable Markdown text everywhere else. */
function renderInteractiveBlocks(markdown: string): string {
	return markdown
		.replace(/^:::accordion[ \t]+(.+)\r?\n([\s\S]*?)^:::\s*$/gm, (_match, title: string, body: string) =>
			`<details class="fracta-accordion" open><summary>${escapeHtml(title.trim())}</summary><div>${escapeHtml(body.trim()).replaceAll('\n', '<br>')}</div></details>`
		)
		.replace(/^:::tabs\s*\r?\n([\s\S]*?)^:::\s*$/gm, (whole: string, body: string) => {
			const tabs = Array.from(body.matchAll(/^::tab[ \t]+(.+)\r?\n([\s\S]*?)(?=^::tab[ \t]+|$)/gm));
			if (tabs.length < 2) return whole;
			const controls = tabs.map((tab, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-fracta-tab="${index}">${escapeHtml(tab[1].trim())}</button>`).join('');
			const panels = tabs.map((tab, index) => `<div role="tabpanel" data-fracta-panel="${index}"${index ? ' hidden' : ''}>${escapeHtml(tab[2].trim()).replaceAll('\n', '<br>')}</div>`).join('');
			return `<section class="fracta-tabs"><div role="tablist" aria-label="Document tabs">${controls}</div>${panels}</section>`;
		});
}

function escapeAttribute(value: string) { return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;'); }
function escapeHtml(value: string) { return escapeAttribute(value).replaceAll('>', '&gt;'); }

/** HTML (from the editor, or a rich paste) → markdown (for disk). */
export function htmlToMarkdown(html: string): string {
	return turndown.turndown(html).trim();
}
