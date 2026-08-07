/**
 * Server-side listing only.
 * Eager raw globs — do NOT import this module from client components.
 * Use from +layout.server.ts / +page.server.ts / navigation.ts only.
 */
import {
	CONTENT_ROOT,
	HREF_PREFIX,
	isIndexPath,
	parseFrontmatter,
	slugFromPath,
	titleFromMeta,
	toSourcePath,
	type DocListItem,
	type DocMeta
} from './content-shared.js';

// Vite requires a static string literal here (no `${CONTENT_ROOT}` templates).
const rawModules = import.meta.glob<string>('/src/content/**/*.md', {
	query: '?raw',
	eager: true,
	import: 'default'
});

type ContentRecord = {
	path: string;
	slug: string;
	source: string;
};

function buildRegistry(): Map<string, ContentRecord> {
	const map = new Map<string, ContentRecord>();

	for (const [path, source] of Object.entries(rawModules)) {
		const slug = slugFromPath(path);
		const record: ContentRecord = { path, slug, source };
		const existing = map.get(slug);

		if (!existing) {
			map.set(slug, record);
			continue;
		}

		if (isIndexPath(existing.path) && !isIndexPath(path)) {
			map.set(slug, record);
		}
	}

	return map;
}

let registryCache: Map<string, ContentRecord> | null = null;

function getRegistry(): Map<string, ContentRecord> {
	if (!registryCache) registryCache = buildRegistry();
	return registryCache;
}

export function resolveContentPath(slug: string): string | null {
	return getRegistry().get(slug)?.path ?? null;
}

function recordToListItem(record: ContentRecord): DocListItem | null {
	const meta = parseFrontmatter(record.source);
	if (meta.draft) return null;

	const { slug, path } = record;
	if (!slug) return null;

	const title = titleFromMeta(meta, slug);
	const description =
		(typeof meta.description === 'string' ? meta.description : '') || '';

	return {
		slug,
		title,
		description,
		tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
		href: slug ? `${HREF_PREFIX}/${slug}` : HREF_PREFIX,
		path,
		sourcePath: toSourcePath(path),
		meta: {
			...meta,
			title,
			description
		}
	};
}

export function getAllDocs(): DocListItem[] {
	const posts: DocListItem[] = [];

	for (const record of getRegistry().values()) {
		const item = recordToListItem(record);
		if (item) posts.push(item);
	}

	return posts.sort((a, b) => {
		const orderDiff = (a.meta.order ?? 999) - (b.meta.order ?? 999);
		if (orderDiff !== 0) return orderDiff;
		return a.title.localeCompare(b.title);
	});
}

export function getDocsByDirectory(directory: string): DocListItem[] {
	const normalized = directory.replace(/^\/+|\/+$/g, '');
	return getAllDocs().filter(
		(doc) => doc.slug === normalized || doc.slug.startsWith(`${normalized}/`)
	);
}

export type { DocListItem, DocMeta };
