/** Supported local documentation source extensions. */
export const contentExtensions = ['.md', '.svx'] as const;

export type ContentExtension = (typeof contentExtensions)[number];

/**
 * Stable, serializable identity shared by content discovery and route adapters.
 * `sourcePath` is absolute; `relativePath` is relative to the configured content root.
 */
export interface DiscoveredContent {
	/** Collection identity assigned by the compiler integration. Defaults to the legacy collection. */
	collection?: string;
	sourcePath: string;
	relativePath: string;
	extension: ContentExtension;
	slugSegments: string[];
	slug: string;
	pathname: string;
	/** Optional documentation version dimension supplied by the discovery integration. */
	version?: string;
	/** Optional documentation locale dimension supplied by the discovery integration. */
	locale?: string;
	/** Stable source content hash used to identify stale translations. */
	contentHash?: string;
	/** Hash of the default-locale source used when this translation was produced. */
	translationSourceHash?: string;
	/** Raw document text, present when discovery was asked to read sources. */
	raw?: string;
}

function normalizeSeparators(path: string): string {
	return path.replace(/\\/g, '/');
}

function removeRelativePrefix(path: string): string {
	return path.replace(/^(?:\.\/)+/, '');
}

/** Returns a supported extension when `path` names a documentation source. */
export function contentExtensionFromPath(path: string): ContentExtension | undefined {
	const normalizedPath = normalizeSeparators(path);
	return contentExtensions.find((extension) => normalizedPath.endsWith(extension));
}

/**
 * Converts a relative Markdown/mdsvex source path into URL slug segments.
 * Directory and root `index` documents resolve to their containing path.
 */
export function pathToSlugSegments(path: string): string[] {
	const normalizedPath = removeRelativePrefix(normalizeSeparators(path));
	const extension = contentExtensionFromPath(normalizedPath);
	const pathWithoutExtension = extension
		? normalizedPath.slice(0, -extension.length)
		: normalizedPath;
	const segments = pathWithoutExtension.split('/').filter(Boolean);

	if (segments.at(-1) === 'index') {
		segments.pop();
	}

	return segments;
}

/** Converts a relative source path into its deterministic slash-delimited slug. */
export function pathToSlug(path: string): string {
	return pathToSlugSegments(path).join('/');
}

/** Converts a content slug into its canonical pathname relative to its mount point. */
export function slugToPathname(slug: string): string {
	return slug ? `/${slug}` : '/';
}
