import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import matter from 'gray-matter';

export type Collection = 'posts' | 'sveltemotion';

export interface DocMeta {
	title?: string;
	description?: string;
	date?: string;
	tags?: string[];
	[key: string]: unknown;
}

export interface TocEntry {
	id: string;
	text: string;
	level: 2 | 3;
}

export interface Doc {
	collection: Collection;
	slug: string;
	file: string;
	raw: string;
	/** markdown body with frontmatter stripped */
	body: string;
	meta: DocMeta;
	/** true when the source was MDX importing Svelte components (script blocks / $lib) */
	hasComponents: boolean;
}

// The copied folders live at the site root: posts/*.md and sveltemotion/*.md.
// import.meta.glob is static: one literal call per folder.
const rawPosts = import.meta.glob('../../../posts/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const rawMotion = import.meta.glob('../../../sveltemotion/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const COLLECTION_FILES: Record<Collection, Record<string, string>> = {
	posts: rawPosts,
	sveltemotion: rawMotion
};

// MDX detection: strip fenced and inline code, then look for a top-level
// <script> block at line start. Every imported-MDX file has one right after
// frontmatter; plain posts only mention <script> inside code examples (fenced or
// inline) or in prose, so they must not count. Verified across all 57 docs:
// 0 false positives, 36/36 MDX detected.
const COMPONENT_HINT = /^\s*<script\b/m;

function withoutCode(md: string): string {
	return md
		.replace(/```[\s\S]*?```/g, '') // fenced blocks
		.replace(/`[^`\n]+`/g, ''); // inline code
}

function slugFromFile(file: string): string {
	return file.split('/').pop()?.replace(/\.md$/, '') ?? '';
}

function parseDoc(collection: Collection, file: string, raw: string): Doc {
	const { data, content } = matter(raw);
	return {
		collection,
		slug: slugFromFile(file),
		file,
		raw,
		body: content,
		meta: data as DocMeta,
		hasComponents: COMPONENT_HINT.test(withoutCode(raw))
	};
}

export function titleOf(doc: Doc): string {
	return doc.meta.title ?? doc.slug.replace(/[-_]/g, ' ');
}

/** YAML dates parse to JS Dates (or stay strings); normalize to YYYY-MM-DD. */
export function formatDate(value: unknown): string | undefined {
	if (!value) return undefined;
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}
	const s = String(value).trim();
	return s.length >= 10 ? s.slice(0, 10) : s;
}

export function listDocs(collection: Collection): Doc[] {
	return Object.entries(COLLECTION_FILES[collection])
		.map(([file, raw]) => parseDoc(collection, file, raw))
		.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
}

export function getDoc(collection: Collection, slug: string): Doc | undefined {
	const entry = Object.entries(COLLECTION_FILES[collection]).find(
		([file]) => slugFromFile(file) === slug
	);
	if (!entry) return undefined;
	return parseDoc(collection, entry[0], entry[1]);
}

// Sanitize must run LAST so foreign raw HTML (script blocks, <Example> components
// from the source MDX project) is removed, while shiki's inline styles and the
// rehype-slug anchors survive. The schema is the default plus style/class/id.
const BASE_ATTRS = defaultSchema.attributes ?? {};
const sanitizeSchema = {
	...defaultSchema,
	attributes: {
		...BASE_ATTRS,
		// className/id everywhere (shiki classes + rehype-slug anchors); inline
		// style only on the elements shiki itself styles, to limit CSS injection
		// from foreign raw HTML.
		'*': [...(BASE_ATTRS['*'] ?? []), 'className', 'id'],
		code: ['className', 'style'],
		pre: ['className', 'style'],
		span: ['className', 'style']
	}
};

export async function renderMarkdown(markdown: string): Promise<string> {
	const file = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype)
		.use(rehypeShiki, {
			theme: 'github-dark',
			addLanguageClass: true,
			onError: (err) => console.warn('[testsite/shiki]', err)
		})
		.use(rehypeSlug)
		.use(rehypeSanitize, sanitizeSchema)
		.use(rehypeStringify)
		.process(markdown);
	return String(file);
}

/** Pull h2/h3 anchors out of the rendered HTML for the on-this-page TOC. */
export function extractHeadings(html: string): TocEntry[] {
	const out: TocEntry[] = [];
	// id may appear after other attributes (class etc.) — match it anywhere in the tag
	const re = /<h([23])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html))) {
		out.push({
			id: m[2],
			text: m[3].replace(/<[^>]+>/g, '').trim(),
			level: m[1] === '3' ? 3 : 2
		});
	}
	return out;
}
