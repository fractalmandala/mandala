import { marked, Marked } from 'marked';
import GithubSlugger from 'github-slugger';

marked.setOptions({
	gfm: true,
	breaks: false
});

export interface TocHeading {
	id: string;
	text: string;
	depth: 2 | 3;
}

/**
 * Minimal frontmatter parser for skill/agent/command YAML-like headers.
 * Handles `key: value`, quoted strings, and ignores complex nested YAML.
 */
export function parseFrontmatter(raw: string): {
	data: Record<string, string>;
	content: string;
} {
	const text = raw.replace(/^\uFEFF/, '');
	if (!text.startsWith('---')) {
		return { data: {}, content: text };
	}

	const close = text.indexOf('\n---', 3);
	if (close === -1) {
		return { data: {}, content: text };
	}

	const fm = text.slice(4, close);
	const content = text.slice(close + 4).replace(/^\r?\n/, '');
	const data: Record<string, string> = {};

	for (const line of fm.split(/\r?\n/)) {
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (!match) continue;
		let value = match[2].trim();
		if (
			(value.startsWith("'") && value.endsWith("'")) ||
			(value.startsWith('"') && value.endsWith('"'))
		) {
			value = value.slice(1, -1);
		}
		// Drop trailing inline comments that are not inside quotes (already stripped)
		data[match[1]] = value;
	}

	return { data, content };
}

export function titleFromMarkdown(body: string, fallback: string): string {
	const h1 = body.match(/^#\s+(.+)$/m);
	if (h1?.[1]) return h1[1].trim();
	return fallback;
}

export function excerptFromMarkdown(body: string, max = 180): string {
	const lines = body
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l && !l.startsWith('#') && !l.startsWith('```') && !l.startsWith('|'));
	const text = lines.join(' ').replace(/\s+/g, ' ').trim();
	if (text.length <= max) return text;
	return `${text.slice(0, max - 1).trim()}…`;
}

const CORE_DOC_SLUGS = new Set([
	'agents',
	'soul',
	'customize',
	'readme',
	'troubleshooting-root',
	'integration-snippet'
]);

const GUIDE_INDEX_SLUGS = new Set(['bosses', 'orchestration', 'armory', 'wiki']);

function normalizePath(parts: string[]): string[] {
	const normalized: string[] = [];
	for (const part of parts) {
		if (!part || part === '.') continue;
		if (part === '..') {
			normalized.pop();
			continue;
		}
		normalized.push(part);
	}
	return normalized;
}

/**
 * Resolve relative links from a plugin/docs page before applying the generic
 * asset rewrites below. The renderer does not otherwise know whether
 * `./runtime.md` lives beside a root guide or inside a section hub.
 */
function rewriteRelativeGuideLinks(html: string, sourceSlug: string): string {
	if (CORE_DOC_SLUGS.has(sourceSlug)) return html;

	const sourceParts = sourceSlug.split('/');
	const sourceDir = GUIDE_INDEX_SLUGS.has(sourceSlug)
		? [sourceSlug]
		: sourceParts.length > 1
			? sourceParts.slice(0, -1)
			: [];

	return html.replace(/href="([^"]+)"/g, (attribute, href: string) => {
		if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(href)) return attribute;

		const hashIndex = href.indexOf('#');
		const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
		const hash = hashIndex === -1 ? '' : href.slice(hashIndex);
		const repoPath = normalizePath(['docs', ...sourceDir, ...pathPart.split('/')]);
		const routePath = routeForRepoPath(repoPath);
		return routePath ? `href="${routePath}${hash}"` : attribute;
	});
}

function routeForRepoPath(parts: string[]): string | null {
	const path = parts.join('/').replace(/\.md$/i, '');

	if (path === 'docs/INDEX') return '/docs/guide';
	if (path === 'skills/INDEX') return '/skills';
	if (path === 'agents/INDEX') return '/agents';
	if (path === 'commands/INDEX') return '/commands';
	if (path === 'hooks/README') return '/docs/hooks';
	if (path.startsWith('docs/')) {
		const guidePath = path.slice('docs/'.length).replace(/\/(?:INDEX|index)$/i, '');
		return `/docs/${guidePath || 'guide'}`;
	}
	if (path === 'AGENTS') return '/docs/agents';
	if (path === 'SOUL') return '/docs/soul';
	if (path === 'CUSTOMIZE') return '/docs/customize';
	if (path === 'README') return '/docs/readme';
	if (path === 'TROUBLESHOOTING') return '/docs/troubleshooting-root';
	if (path === 'project-integration/AGENTS-SNIPPET') return '/docs/integration-snippet';

	const [kind, slug, ...rest] = path.split('/');
	if (!slug || (rest.length > 0 && !(rest.length === 1 && rest[0] === 'SKILL'))) return null;
	if (kind === 'skills') return `/skills/${slug}`;
	if (kind === 'agents') return `/agents/${slug}`;
	if (kind === 'commands') return `/commands/${slug}`;
	return null;
}

/**
 * Rewrite common in-repo relative .md links to explorer routes.
 * Nested skill reference files (references/*.md) are left alone / warned at prerender.
 */
export function rewriteMarkdownLinks(html: string, sourceSlug?: string): string {
	const contextualHtml = sourceSlug ? rewriteRelativeGuideLinks(html, sourceSlug) : html;

	return (
		contextualHtml
			// skills/foo or skills/foo/SKILL.md (with optional ./ ../ prefixes)
			.replace(/href="(?:\.\.\/)*(?:\.\/)?skills\/INDEX(?:\.md)?"/g, 'href="/skills"')
			.replace(
				/href="(?:\.\.\/)*(?:\.\/)?skills\/([A-Za-z0-9._-]+)(?:\/SKILL\.md)?"/g,
				'href="/skills/$1"'
			)
			// bare skill folder links ending in SKILL.md
			.replace(/href="(?:\.\.\/)*(?:\.\/)?([A-Za-z0-9._-]+)\/SKILL\.md"/g, 'href="/skills/$1"')
			// agents
			.replace(/href="(?:\.\.\/)*(?:\.\/)?agents\/INDEX(?:\.md)?"/g, 'href="/agents"')
			.replace(
				/href="(?:\.\.\/)*(?:\.\/)?agents\/([A-Za-z0-9._-]+)(?:\.md)?"/g,
				'href="/agents/$1"'
			)
			// commands
			.replace(/href="(?:\.\.\/)*(?:\.\/)?commands\/INDEX(?:\.md)?"/g, 'href="/commands"')
			.replace(
				/href="(?:\.\.\/)*(?:\.\/)?commands\/([A-Za-z0-9._-]+)(?:\.md)?"/g,
				'href="/commands/$1"'
			)
			// core docs
			.replace(/href="(?:\.\.\/)*(?:\.\/)?AGENTS\.md(#[^"]*)?"/g, 'href="/docs/agents$1"')
			.replace(/href="(?:\.\.\/)*(?:\.\/)?SOUL\.md(#[^"]*)?"/g, 'href="/docs/soul$1"')
			.replace(/href="(?:\.\.\/)*(?:\.\/)?CUSTOMIZE\.md(#[^"]*)?"/g, 'href="/docs/customize$1"')
			.replace(/href="(?:\.\.\/)*(?:\.\/)?README\.md(#[^"]*)?"/g, 'href="/docs/readme$1"')
			.replace(
				/href="(?:\.\.\/)*(?:\.\/)?(?:docs\/)?(doc-ownership|hooks|self-improvement)\.md(#[^"]*)?"/g,
				'href="/docs/$1$2"'
			)
			.replace(
				/href="(?:\.\.\/)*(?:\.\/)?project-integration\/AGENTS-SNIPPET\.md"/g,
				'href="/docs/integration-snippet"'
			)
			.replace(/href="(?:\.\.\/)*(?:\.\/)?hooks\/README\.md"/g, 'href="/docs/hooks"')
			// plugin/docs/** guides (relative .md → /docs/…)
			.replace(
				/href="(?:\.\.\/)*(?:\.\/)?docs\/([A-Za-z0-9._/-]+?)(?:\.md)?(#[^"]*)?"/g,
				'href="/docs/$1$2"'
			)
			// same-tree relative guides: bosses/design/INDEX.md, ./wiki/setup.md
			.replace(
				/href="(?:\.\/)?((?:bosses|orchestration|armory|wiki)\/[A-Za-z0-9._/-]+)\.md(#[^"]*)?"/g,
				'href="/docs/$1$2"'
			)
			.replace(
				/href="(?:\.\/)?((?:00-overview|01-getting-started|02-install|03-auto-use|progression|glossary|hooks|scripts|troubleshooting|INDEX))\.md(#[^"]*)?"/g,
				(_, slug: string, hash = '') => `href="/docs/${slug === 'INDEX' ? 'guide' : slug}${hash}"`
			)
			.replace(/href="\/docs\/INDEX(?:\.md)?"/g, 'href="/docs/guide"')
			.replace(
				/href="\/docs\/((?:bosses|orchestration|armory|wiki))\/(?:INDEX|index)(?:\.md)?"/g,
				'href="/docs/$1"'
			)
			// same-dir skill self-link
			.replace(/href="(?:\.\/)?SKILL\.md"/g, 'href="."')
			// strip accidental .md from catalog routes
			.replace(/href="\/skills\/([^"#]+)\/SKILL\.md"/g, 'href="/skills/$1"')
			.replace(/href="\/agents\/([^"#]+)\.md"/g, 'href="/agents/$1"')
			.replace(/href="\/commands\/([^"#]+)\.md"/g, 'href="/commands/$1"')
	);
}

export async function renderMarkdown(body: string, sourceSlug?: string): Promise<string> {
	const html = await marked.parse(body);
	return rewriteMarkdownLinks(typeof html === 'string' ? html : String(html), sourceSlug);
}

/**
 * Render markdown AND extract an "On this page" TOC in a single pass so the
 * heading ids emitted into the HTML always match the TOC anchor ids. `marked`
 * adds no heading ids of its own; we slug every heading with the same
 * GithubSlugger the docs pipeline (rehype-slug) uses, and collect h2/h3 into
 * the TOC. A fresh Marked instance per call keeps the slugger/toc state from
 * leaking across concurrent prerender loads.
 */
export async function renderMarkdownWithToc(
	body: string,
	sourceSlug?: string
): Promise<{ html: string; toc: TocHeading[] }> {
	// The detail page already renders the entry title as the page <h1>, so drop
	// the markdown's own leading '# Heading' to avoid showing the title twice.
	const source = body.replace(/^\s*#\s+.*(?:\r?\n)+/, '');

	const slugger = new GithubSlugger();
	const toc: TocHeading[] = [];
	const instance = new Marked({ gfm: true, breaks: false });

	instance.use({
		renderer: {
			heading(token) {
				const depth = token.depth;
				const inner = this.parser.parseInline(token.tokens);
				const plain = inner
					.replace(/<[^>]+>/g, '')
					.replace(/&amp;/g, '&')
					.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'")
					.trim();
				const id = slugger.slug(plain);
				if (depth === 2 || depth === 3) {
					toc.push({ id, text: plain, depth });
				}
				return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
			}
		}
	});

	const html = await instance.parse(source);
	return {
		html: rewriteMarkdownLinks(typeof html === 'string' ? html : String(html), sourceSlug),
		toc
	};
}

/** Render short Markdown descriptions without introducing block-level markup. */
export function renderInlineMarkdown(body: string): string {
	const html = marked.parseInline(body, { async: false });
	return rewriteMarkdownLinks(html);
}

export function humanizeSlug(slug: string): string {
	return slug
		.split(/[-_]/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}
