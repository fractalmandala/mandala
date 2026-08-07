// @ts-nocheck — plain-JS config helper consumed by svelte.config.js and the
// wiki store; deliberately untyped (runs in Node config context too).

/**
 * Tolerant frontmatter handling for the repowiki content.
 *
 * Some generated frontmatter contains plain scalars that are *not* valid
 * YAML — most commonly a `description` that ends with `:` or contains
 * `: ` (which every strict YAML engine, js-yaml and PyYAML alike, rejects
 * as an "incomplete explicit mapping pair"). Instead of rewriting the
 * content on disk, this module makes the wiki app tolerant:
 *
 *  - `sanitizeFrontmatter(md)` quotes those plain scalars so gray-matter
 *    (used by svelte-docs-scaffold to build the docs store) parses cleanly.
 *  - `parseFrontmatter(fm)` is a dependency-free line parser for the same
 *    simple `key: value` schema, used by mdsvex's `frontmatter.parse` hook
 *    so rendering never depends on a strict YAML engine.
 */

import { dirname, relative, resolve, sep } from 'node:path';
import { existsSync, realpathSync, readFileSync } from 'node:fs';

const KEY_RE = /^([A-Za-z_][\w-]*):\s*(.*)$/;
const QUOTE_RE = /^(['"]).*\1$/;

function isAlreadyQuoted(value) {
	return QUOTE_RE.test(value);
}

function isInlineCollection(value) {
	return /^\[.*\]$/.test(value) || /^\{.*\}$/.test(value);
}

function isBlockScalar(value) {
	return /^[|>]/.test(value);
}

function isPlainSafe(value) {
	// numbers, dates, booleans, null — keep unquoted so gray-matter keeps
	// their native types (order: 3 stays a number, created: 2026-08-05 a date)
	if (!/[:#]/.test(value) && /^-?(?:\d|true|false|null|~)/i.test(value)) return true;
	// a plain scalar cannot start with a block/flow indicator (`- `, `? `, `[`,
	// `{`, `!`, `&`, `*`, `|`, `>`, `'`, `"`, `%`, `@`, backtick, `,`, `#`)
	return !/:\s|:\s*$|#[^0-9a-fA-FxX]|\s$/.test(value) && !/^[!&*%@`"'[\]{}?,.#\-]/.test(value);
}

/** True when a plain YAML scalar value needs double-quoting to stay valid. */
function needsQuoting(value) {
	if (!value) return false;
	if (isAlreadyQuoted(value) || isInlineCollection(value) || isBlockScalar(value)) return false;
	return !isPlainSafe(value);
}

/**
 * Rewrite the YAML frontmatter of a markdown string so every plain scalar
 * is valid. All other content is untouched. Returns the original string
 * when there is no `---` frontmatter block.
 */
export function sanitizeFrontmatter(md) {
	if (!md.startsWith('---\n')) return md;
	const lines = md.split('\n');
	let end = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i] === '---' || lines[i] === '...') {
			end = i;
			break;
		}
	}
	if (end === -1) return md;
	const out = [...lines];
	for (let i = 1; i < end; i++) {
		const m = KEY_RE.exec(lines[i]);
		if (!m) continue;
		const value = m[2];
		if (needsQuoting(value)) {
			const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
			out[i] = `${m[1]}: "${escaped}"`;
		}
	}
	return out.join('\n');
}

function unquote(s) {
	if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
	return s;
}

/**
 * Escape `{` and `}` to HTML entities in markdown *prose* so the Svelte
 * compiler (mdsvex compiles markdown as a Svelte template) does not try to
 * interpret literal braces — the repowiki content uses `{{key}}` / `{ ... }`
 * examples in plain text. Fenced code, inline code and the frontmatter block
 * are left untouched (mdsvex escapes code itself).
 */
export function escapeSvelteBraces(markdown) {
	const esc = (s) => s.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');

	let i = 0;
	let out = '';

	// Leave the `---` frontmatter block as-is.
	if (markdown.startsWith('---\n')) {
		const close = markdown.indexOf('\n---', 1);
		if (close !== -1) {
			const lineEnd = markdown.indexOf('\n', close + 1);
			const end = lineEnd === -1 ? markdown.length : lineEnd + 1;
			out += markdown.slice(0, end);
			i = end;
		}
	}

	const rest = markdown.slice(i);
	const parts = rest.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g);
	for (const part of parts) {
		if (!part) continue;
		if (/^(```|~~~)/.test(part)) {
			out += part; // fenced code — mdsvex escapes braces itself
		} else {
			// Escape prose, but never inline code spans.
			out += part
				.split(/(`[^`\n]*`)/g)
				.map((seg) => (seg.startsWith('`') && seg.endsWith('`') ? seg : esc(seg)))
				.join('');
		}
	}
	return out;
}

/**
 * Dependency-free parser for the repowiki frontmatter schema (string keys,
 * scalar values, inline `[a, b]` arrays and `- item` block lists). Never
 * throws; always returns an object. Designed for mdsvex's
 * `frontmatter.parse` hook.
 */
/**
 * HTML tags the wiki content legitimately uses in raw-HTML blocks. Anything
 * else that looks like a tag (`<Category>`, `<string, …>`, `<html>`) is
 * prose and gets escaped.
 */
const KNOWN_TAGS = new Set([
	'a', 'abbr', 'b', 'blockquote', 'br', 'cite', 'code', 'dd', 'del', 'details', 'div', 'dl', 'dt',
	'em', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i',
	'img', 'ins', 'kbd', 'li', 'main', 'mark', 'nav', 'ol', 'p', 'path', 'pre', 'q', 's', 'section', 'small',
	'span', 'strong', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody', 'td', 'th', 'thead', 'time', 'tr', 'u',
	'ul', 'var', 'wbr'
]);

/**
 * Rewrite `<a href="...">` inside raw-HTML nodes the same way `link` nodes
 * are handled (wiki `.md` targets become routes; everything else — legacy
 * `/docs/...` site links, source files — drops to its label text so the
 * prerender crawler never follows them).
 */
function rewriteHtmlLinks(value, fromDir) {
	const A_RE = /<a\s+([^>]*)href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g;
	return value.replace(A_RE, (m, pre, href, post, inner) => {
		if (/^(https?:|mailto:|tel:|#)/.test(href)) return m;
		const pathPart = href.split('#')[0];
		if (!pathPart) return m;
		const abs = pathPart.startsWith('/')
			? resolve(WIKI_ROOT, pathPart.replace(/^\//, ''))
			: fromDir
				? resolve(fromDir, pathPart)
				: resolve(pathPart);
		const rel = relative(WIKI_ROOT, abs).split(sep).join('/');
		if (/\.md$/i.test(pathPart) && !rel.startsWith('..') && existsSync(abs)) {
			const route = rel.replace(/\.md$/i, '').replace(/\/INDEX$/, '');
			return `<a ${pre}href="/${route}"${post}>${inner}</a>`;
		}
		// Not a wiki page — drop the link, keep the label.
		return inner;
	});
}

/**
 * Escape `<` that is *not* the start of a complete, known HTML tag (e.g. the
 * `Record<string, unknown>`, `content/<Category>/<slug>.md`, `<= 1024px` or
 * `<500 lines` in prose) so Svelte's template parser does not mistake it for
 * an element boundary. A lone `>` is harmless in Svelte text, so only the
 * `<` needs escaping. Known tags (`<div class="x">`, `</ul>`, `<br/>`) pass
 * through untouched.
 */
function escapeAngleBrackets(value) {
	const TAG_OPEN = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^<>]*?)?\/?>/;
	let out = '';
	let i = 0;
	while (i < value.length) {
		if (value[i] !== '<') {
			out += value[i];
			i++;
			continue;
		}
		const rest = value.slice(i);
		const m = TAG_OPEN.exec(rest);
		if (m && KNOWN_TAGS.has(m[1].toLowerCase())) {
			out += m[0];
			i += m[0].length;
		} else {
			out += '&lt;';
			i++;
		}
	}
	return out;
}

const LI_OPEN = /^<li(?:\s[^>]*)?>$/;
const LI_CLOSE = /^<\/li>$/;
const LI_FULL = /^<li[^>]*>[\s\S]*<\/li>$/;

/**
 * The ported content occasionally has raw `<li>` blocks with no `<ul>`/`<ol>`
 * wrapper (browsers repair this; Svelte's parser rejects it). Wrap maximal
 * runs of bare `<li>` siblings in a `<ul>` — unless a list is already open.
 */
function wrapOrphanListItems(children) {
	const out = [];
	let inList = false;
	let i = 0;
	while (i < children.length) {
		const node = children[i];
		if (node.type === 'html' && typeof node.value === 'string') {
			const v = node.value.trim();
			if (/^<ul[^>]*>/.test(v) || /^<ol[^>]*>/.test(v)) inList = true;
			else if (/^<\/(ul|ol)>/.test(v)) inList = false;
		}
		const n = children[i];
		const isOpen = n.type === 'html' && typeof n.value === 'string' && LI_OPEN.test(n.value.trim()) && !n.value.includes('</li');
		const isFull = n.type === 'html' && typeof n.value === 'string' && LI_FULL.test(n.value.trim());

		if ((isOpen || isFull) && !inList) {
			let j = i + 1;
			let depth = isOpen ? 1 : 0;
			if (depth === 0) {
				while (j < children.length && children[j].type === 'html' && typeof children[j].value === 'string' && LI_FULL.test(children[j].value.trim())) j++;
			} else {
				while (j < children.length) {
					const c = children[j];
					if (c.type === 'html' && typeof c.value === 'string' && LI_CLOSE.test(c.value.trim())) {
						depth--;
						j++;
						break;
					}
					if (c.type === 'html' && typeof c.value === 'string' && LI_OPEN.test(c.value.trim())) depth++;
					j++;
				}
			}
			out.push({ type: 'html', value: '<ul>' });
			out.push(...children.slice(i, j));
			out.push({ type: 'html', value: '</ul>' });
			i = j;
		} else {
			out.push(n);
			i++;
		}
	}
	return out;
}

const WIKI_ROOT = resolve(process.cwd(), '../../repowiki');
const REPO_ROOT = resolve(WIKI_ROOT, '..');

/** GitHub repo for linking referenced source files (`blob/main/<path>`). */
const GITHUB_BLOB_BASE = 'https://github.com/fractalmandala/mandala/blob/main';

/* ------------------------------------------------------------------ */
/*  Source-reference blocks (`<cite>` + bare `**Section sources**`)    */
/* ------------------------------------------------------------------ */

/** Headers that introduce a list of source-file references. */
const REF_HEADERS = new Set([
	'Section sources',
	'Diagram sources',
	'Referenced Files in This Document',
	'Files:',
	'Interfaces:'
]);

/** Per-extension accent colors for the file chips. */
const EXT_COLORS = {
	rs: '#dea584', ts: '#5b9bd5', tsx: '#5b9bd5', js: '#e8d44d', mjs: '#e8d44d', cjs: '#e8d44d',
	svelte: '#ff6d5a', vue: '#42b883', astro: '#ff5d01', css: '#cf649a', scss: '#cf649a', sass: '#cf649a',
	json: '#6fbf73', toml: '#6fbf73', yaml: '#6fbf73', yml: '#6fbf73', md: '#9aa1a9', markdown: '#9aa1a9',
	html: '#e34f26', py: '#4b8bbe', go: '#00add8', rs: '#dea584', svelteconfig: '#ff6d5a',
	conf: '#c9a86a', lock: '#c9a86a', gitignore: '#9aa1a9', woof: '#c9a86a', svg: '#ffb13b', png: '#ffb13b'
};

const REF_ICON =
	'<svg class="rf-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 2.75h8L19.5 8.25V21.25H6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 2.75v5.5h5.5M8.5 13h7M8.5 16.5h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function esc(s) {
	return String(s ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function extOf(path) {
	const base = path.split('/').pop() ?? '';
	const m = /\.([A-Za-z0-9]+)$/.exec(base);
	return m ? m[1].toLowerCase() : '';
}

function refItem(label, url, fromDir) {
	// label may carry a line range (`blume.config.ts:1-67`); url may carry an
	// anchor (`#L1-L67`). Resolve the url to a repo-relative path when it is a
	// relative source reference.
	let path = url;
	let range = '';
	const anch = /#(L\d+(?:-L\d+)?|\d+-\d+)/.exec(url ?? '');
	if (anch) range = anch[1];
	path = (url ?? '').split('#')[0];
	const lm = /:([0-9]+-[0-9]+)$/.exec(label ?? '');
	if (!range && lm) range = lm[1];

	const clean = label?.replace(/:\d+-\d+$/, '') ?? '';
	let name = clean;
	let dir = '';
	let rel = '';

	if (path && !/^https?:/i.test(path)) {
		// Refs come in two conventions: markdown links resolve relative to the
		// wiki file, inline-code refs resolve relative to the monorepo root.
		// Try each base and prefer the candidate that actually exists on disk
		// (fall back to the first candidate for display purposes).
		let abs;
		const candidates = [];
		if (path.startsWith('/')) candidates.push(resolve(REPO_ROOT, path.replace(/^\//, '')));
		if (fromDir) candidates.push(resolve(fromDir, path));
		candidates.push(resolve(REPO_ROOT, path), resolve(WIKI_ROOT, path));
		abs = candidates.find((c) => existsSync(c)) ?? candidates[0];
		// A filesystem-absolute path (e.g. `/Users/<user>/mandala/...`) is
		// NOT repo-root-relative; strip the leading `/` only when it is a
		// repo-relative slug. The candidates above already handle the
		// common cases, so this is purely a display fallback.
		if (!existsSync(abs) && /^\/Users\//.test(path)) {
			abs = resolve(REPO_ROOT, path.replace(/^\/Users\/[^/]+\/[^/]+\//, ''));
		}
		// Prefer the shortest clean repo-relative label: inside `repowiki/`
		// use the wiki-relative path; otherwise (source files elsewhere in
		// the monorepo) fall back to the monorepo-relative path.
		const relWiki = relative(WIKI_ROOT, abs).split(sep).join('/');
		const relMono = relative(REPO_ROOT, abs).split(sep).join('/');
		const cleanWiki = !relWiki.startsWith('..') && !relWiki.startsWith('/') && relWiki !== '.';
		const cleanMono = !relMono.startsWith('..') && !relMono.startsWith('/') && relMono !== '.';
		rel = cleanWiki ? relWiki : cleanMono ? relMono : '';
		if (rel) {
			const parts = rel.split('/');
			name = parts.pop() || clean; // `||` not `??`: a trailing `/` splits to `''`
			dir = parts.join('/');
		} else {
			dir = path;
		}
	}
	if (!name) name = clean;

	const ext = extOf(name || path);
	const color = EXT_COLORS[ext] ?? '#8b8f98';

	// Link to the file on GitHub when the path resolves to a clean
	// repo-relative path; the line range becomes a `#L1-L67` fragment.
	// `range` may be `L1-L67` or `1-67`; GitHub wants `#L1-L67` (both
	// numbers need the `L` prefix).
	const ghRange = range
		? range.startsWith('L')
			? range
			: range.replace(/^(\d+)-(\d+)$/, 'L$1-L$2')
		: '';
	const ghUrl =
		rel && !rel.includes('..') && !rel.startsWith('/')
			? `${GITHUB_BLOB_BASE}/${rel}${ghRange ? `#${ghRange}` : ''}`
			: '';
	const item = `<span class="rf-badge">${esc(ext || '·')}</span>`
		+ `<span class="rf-body"><span class="rf-name">${esc(name)}</span>`
		+ (dir ? `<span class="rf-dir">${esc(dir)}</span>` : '')
		+ `</span>`
		+ (range ? `<span class="rf-range">${esc(range)}</span>` : '');

	if (ghUrl) {
		return `<li class="rf-file" style="--rf:${color}"><a class="rf-link" href="${ghUrl}" target="_blank" rel="noopener noreferrer">${item}</a></li>`;
	}
	return `<li class="rf-file" style="--rf:${color}">${item}</li>`;
}


/**
 * Parse a `- [label](url)` list line with bracket-balanced scanning (labels
 * may contain `[`/`]`, e.g. `[pages/tags/[tag].astro]`). Returns
 * `[label, url]` or null.
 */
function parseRefLink(line) {
	if (!line.startsWith('- [')) return null;
	let i = 2;
	let depth = 0;
	let label = '';
	for (; i < line.length; i++) {
		const c = line[i];
		if (c === '[') depth++;
		else if (c === ']') {
			depth--;
			if (depth === 0) break;
		}
		label += c;
	}
	if (depth !== 0 || line[i] !== ']') return null;
	const rest = line.slice(i + 1);
	const m = /^\s*\(([^)]*)\)\s*$/.exec(rest);
	if (!m) return null;
	return [label, m[1]];
}

/** Build a `<figure class="ref-files">` from a header + raw item lines. */
function buildRefFigure(header, lines, fromDir) {
	const items = [];
	for (const line of lines) {
		const t = line.trim();
		if (!t || t.startsWith('**')) continue;
		const link = parseRefLink(t);
		if (link) {
			items.push(refItem(link[0], link[1], fromDir));
			continue;
		}
		const code = /^- `([^`]+)`$/.exec(t);
		if (code) {
			items.push(refItem(code[1].split('/').pop(), code[1], fromDir));
		}
	}
	if (!items.length) return null;
	return `<figure class="ref-files"><figcaption>${REF_ICON}<span>${esc(header)}</span></figcaption><ul class="rf-list">${items.join('')}</ul></figure>`;
}

/** Transform a raw `<cite>…</cite>` HTML block into a ref-files figure. */
function transformCiteRaw(value, fromDir) {
	const m = /^\s*<cite>\s*([\s\S]*?)\s*<\/cite>\s*$/.exec(value);
	if (!m) return null;
	const inner = m[1];
	const lines = inner.split(/\r?\n/);
	const head = lines.map((l) => l.trim()).find((l) => /^\*\*.+\*\*$/.test(l));
	const header = head ? head.replace(/^\*\*|\*\*$/g, '') : 'Referenced files';
	return buildRefFigure(header, lines, fromDir);
}

/**
 * Merge a bare `**Section sources**` / `**Diagram sources**` paragraph with
 * the list that follows it into a single ref-files figure (MDAST level).
 */
function mergeRefBlocks(children, fromDir) {
	const out = [];
	let i = 0;
	while (i < children.length) {
		const node = children[i];
		const headText = node.type === 'paragraph' && node.children?.length === 1 && node.children[0].type === 'strong'
			? (node.children[0].children ?? []).map((c) => c.value ?? '').join('').trim()
			: '';
		const next = children[i + 1];
		// Allow-list only — `/sources$/i` would also match prose headers like
		// `**Resources**` and turn a real paragraph into a file-ref figure.
		const isRefHeader = REF_HEADERS.has(headText);
		if (isRefHeader && next?.type === 'list' && Array.isArray(next.children)) {
			const lines = next.children.map((item) => {
				const p = item.children?.find((c) => c.type === 'paragraph');
				if (!p?.children?.length) return '';
				const link = p.children.find((c) => c.type === 'link');
				if (link && typeof link.url === 'string') {
					const label = (link.children ?? []).map((c) => c.value ?? '').join('');
					return `- [${label}](${link.url})`;
				}
				const code = p.children.find((c) => c.type === 'inlineCode');
				if (code) return `- \`${code.value}\``;
				return '';
			}).filter(Boolean);
			const fig = buildRefFigure(headText, lines, fromDir);
			if (fig) {
				out.push({ type: 'html', value: fig });
				i += 2;
				continue;
			}
		}
		out.push(node);
		i++;
	}
	return out;
}

/** GitHub-style heading slug (lowercase, punctuation stripped, spaces → dashes). */
function slugify(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Heading slugs for a markdown file (source-level scan, matching the ids
 * the plugin assigns). Used to validate fragment links. Cached per path.
 */
const headingCache = new Map();
function headingsForFile(absPath) {
	if (headingCache.has(absPath)) return headingCache.get(absPath);
	let ids = new Set();
	if (existsSync(absPath)) {
		const text = readFileSync(absPath, 'utf8');
		const seen = new Map();
		for (const m of text.matchAll(/^#{1,6}\s+(.*)$/gm)) {
			const base = slugify(m[1].trim());
			if (!base) continue;
			const n = seen.get(base) ?? 0;
			seen.set(base, n + 1);
			ids.add(n === 0 ? base : `${base}-${n}`);
		}
	}
	headingCache.set(absPath, ids);
	return ids;
}

/**
 * Rewrite file-relative markdown links so they work on the site:
 *
 *  - wiki-internal `.md` targets → absolute routes (`projects/INDEX.md` →
 *    `/projects`, `repo/foo.md` → `/repo/foo`);
 *  - source-file references (`../../../../sites/foo/bar.ts`) and tooling
 *    targets (commands/, scripts/, meta/, TAGINDEX) → plain text, since
 *    those files are not part of the static wiki (and the prerender crawler
 *    must not follow them).
 *
 * Returns the new URL, or `null` to drop the link (keep the label).
 */
function rewriteLinkUrl(url, fromDir) {
	if (/^(https?:|mailto:|tel:|#)/.test(url)) return url;
	const [pathPart, frag] = url.split('#');
	if (!pathPart) return url;
	if (!/\.md$/i.test(pathPart)) return null; // source file → plain text

	const abs = fromDir ? resolve(fromDir, pathPart) : resolve(pathPart);
	const rel = relative(WIKI_ROOT, abs).split(sep).join('/');
	if (rel.startsWith('..') || rel.includes('/TAGINDEX.md') || /^(commands|scripts|meta)\//.test(rel)) return null;
	// Drop links to files that don't exist (self-referential generator
	// artifacts like shared-packages/INDEX.md → shared-packages.md) so the
	// prerender crawler never visits a 404.
	if (!existsSync(abs)) return null;

	const base = rel.replace(/\.md$/i, '');
	const route = base.endsWith('/INDEX') ? base.slice(0, -'/INDEX'.length) : base;
	return '/' + route + (frag ? `#${frag}` : '');
}

/**
 * A remark plugin for mdsvex that makes wiki prose safe for the Svelte
 * compiler, which would otherwise interpret braces, angle brackets and
 * orphan list markup as template syntax, and rewrites file-relative links to
 * site routes. On `text` and raw-`html` nodes it:
 *
 *  - escapes `{` / `}` → `&#123;` / `&#125;` (content uses `{{key}}` and
 *    `{ ... }` examples in plain text);
 *  - escapes `<` / `>` → `&lt;` / `&gt;` when not part of a known HTML tag
 *    (content uses `Record<string, unknown>` and `<Category>` in prose);
 *  - wraps bare `<li>` runs in `<ul>` so Svelte's HTML parser accepts them;
 *    and
 *  - rewrites `link` URLs (wiki pages become routes, source refs become
 *    plain text).
 *
 * Must run after markdown parsing (source-level entities are decoded back to
 * literals), so it operates on the MDAST — the same layer mdsvex itself uses
 * to escape code blocks. Inline code and fenced code are left untouched
 * (mdsvex escapes those itself).
 */	export function escapeBracesRemark() {
		return (tree, file) => {
			// mdsvex passes the file id as `filename` (vfile's `path` stays
			// unset) and `src/content` is a symlink → `../../repowiki`;
			// resolve the real path so relative source refs in the content
			// resolve against the actual monorepo layout.
			let fromDir;
			const fp = file?.filename ?? file?.path;
			if (fp) {
				try {
					fromDir = dirname(realpathSync(fp));
				} catch {
					fromDir = dirname(fp);
				}
			}
			const seenHeadings = new Map();
			// Pre-pass: collect this page's heading slugs so fragment links can
			// be validated against them (its own dedup map, so the walk pass
			// below assigns ids with a fresh counter).
			const pageHeadings = new Set();
			{
				const preSeen = new Map();
				const collect = (node) => {
					if (node.type === 'heading' && Array.isArray(node.children)) {
						const text = node.children.map((c) => c.value ?? '').join('').trim();
						if (text) {
							const base = slugify(text);
							const n = preSeen.get(base) ?? 0;
							preSeen.set(base, n + 1);
							pageHeadings.add(n === 0 ? base : `${base}-${n}`);
						}
					}
					if (Array.isArray(node.children)) node.children.forEach(collect);
				};
				collect(tree);
			}

		const walk = (node, inline = false) => {
			if (node.type === 'heading' && Array.isArray(node.children)) {
				const text = node.children.map((c) => c.value ?? '').join('').trim();
				if (text) {
					const base = slugify(text);
					const n = seenHeadings.get(base) ?? 0;
					seenHeadings.set(base, n + 1);
					node.data = node.data ?? {};
					node.data.hProperties = { ...(node.data.hProperties ?? {}), id: n === 0 ? base : `${base}-${n}` };
				}
			}
			if (node.type === 'link' && typeof node.url === 'string') {
				// Same-page fragment: only keep it if the heading actually exists
				// (stale generated TOCs link to headings that were removed).
				if (node.url.startsWith('#') && !pageHeadings.has(node.url.slice(1))) {
					const label = (node.children ?? []).map((c) => c.value ?? '').join('');
					node.type = 'text';
					node.value = label;
					delete node.children;
					delete node.url;
				} else if (node.url.startsWith('#')) {
					// keep — the heading exists on this page
				} else {
					const [pathPart, frag] = node.url.split('#');
					const rewritten = rewriteLinkUrl(node.url, fromDir);
					if (rewritten === null) {
						// Convert the link to its label text (source-file reference).
						const label = (node.children ?? []).map((c) => c.value ?? '').join('');
						node.type = 'text';
						node.value = label;
						delete node.children;
						delete node.url;
					} else if (frag) {
						// Cross-page fragment: drop the anchor if the target page has
						// no such heading (the page link itself still works).
						const abs = fromDir ? resolve(fromDir, pathPart) : resolve(pathPart);
						node.url = headingsForFile(abs).has(frag) ? rewritten : rewritten.split('#')[0];
					} else {
						node.url = rewritten;
					}
				}
			}
			if (node.type === 'image' && typeof node.url === 'string') {
				// The static wiki ships no binary assets; local image refs
				// (dangling provenance) become their alt text so the
				// prerender crawler does not follow them.
				if (!/^(https?:|data:)/.test(node.url)) {
					node.type = 'text';
					node.value = node.alt ?? '';
					delete node.url;
					delete node.alt;
				}
			}
			if ((node.type === 'text' || node.type === 'html') && typeof node.value === 'string') {
				// Inline context (paragraph/heading text): escape every `<`, since
				// inline HTML like `"<p>..."` in prose JSON is text, not markup.
				// Block-level html nodes keep known tags (e.g. `<div>` blocks).
				let value = node.value;
				// A `<cite>…</cite>` block becomes a styled ref-files figure.
				if (!inline && node.type === 'html') {
					const fig = transformCiteRaw(value, fromDir);
					if (fig) value = fig;
				}
				const escaped = value.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
				node.value = inline ? escaped.replace(/</g, '&lt;') : escapeAngleBrackets(rewriteHtmlLinks(escaped, fromDir));
			}
			if (Array.isArray(node.children)) {
				node.children = wrapOrphanListItems(node.children);
				// Merge bare `**Section sources**`/`**Diagram sources**` header +
				// list pairs into styled ref-files figures.
				node.children = mergeRefBlocks(node.children, fromDir);
				const childInline = inline || node.type === 'paragraph' || node.type === 'heading';
				node.children.forEach((c) => walk(c, childInline));
			}
		};
		walk(tree);
	};
}

export function parseFrontmatter(fm) {
	if (!fm) return {};
	const data = {};
	let current = null;
	const lines = fm.replace(/^\uFEFF/, '').split('\n');
	for (const raw of lines) {
		const line = raw.replace(/\r$/, '');
		if (line === '---' || line === '...') continue;
		const listItem = /^\s*-\s+(.*)$/.exec(line);
		if (listItem && current) {
			data[current].push(unquote(listItem[1].trim()));
			continue;
		}
		const m = KEY_RE.exec(line);
		if (!m) continue;
		const [, key, value] = m;
		current = null;
		if (value === '') {
			current = key;
			data[key] = [];
			continue;
		}
		if (value.startsWith('[') && value.endsWith(']')) {
			data[key] = value
				.slice(1, -1)
				.split(',')
				.map((s) => unquote(s.trim()))
				.filter(Boolean);
		} else {
			data[key] = unquote(value);
		}
	}
	return data;
}
