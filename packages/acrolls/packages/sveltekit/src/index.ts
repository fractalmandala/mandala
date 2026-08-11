import {
	createAcrollsMdsvexOptions,
	createAcrollsMdsvexPreprocessor,
	type AcrollsMdsvexOptions
} from '@acrolls/mdsvex';
import {
	createDocsContentSource,
	type DocsContentConfig,
	type DocsContentSource,
	type DocsMetadata
} from '@acrolls/docs/content';

export type { AcrollsMdsvexOptions };
export { createAcrollsMdsvexOptions, createAcrollsMdsvexPreprocessor } from '@acrolls/mdsvex';
export { defineDocsConfig } from '@acrolls/docs/content';
export type {
	DocsContentConfig,
	DocsContentEntryConfig,
	DocsContentDocument,
	DocsContentInput,
	DocsContentLoader,
	DocsContentSource,
	DocsDocumentConfig,
	DocsFolderConfig,
	DocsMetadata
} from '@acrolls/docs/content';

export type AcrollsDocsGlob<TDocument> = Record<string, () => Promise<TDocument>>;

export type AcrollsDocsSourceOptions<TDocument> = {
	/** The lazy default-component glob returned by import.meta.glob(). */
	modules: AcrollsDocsGlob<TDocument>;
	/** The eager metadata glob, keyed exactly like modules. */
	metadata?: Record<string, DocsMetadata>;
	/** The directory prefix removed from each Vite glob key. */
	contentRoot: string;
	config: DocsContentConfig;
};

/**
 * Adapt Vite's two Markdown globs into the shared Acrolls content source.
 *
 * Use a lazy default-component glob for document bodies and an eager metadata glob:
 *
 * ```ts
 * const modules = import.meta.glob('../../content/<files>.md');
 * const metadata = import.meta.glob('../../content/<files>.md', {
 *   eager: true,
 *   import: 'metadata'
 * });
 * ```
 */
export function createAcrollsDocsSource<TDocument>(
	options: AcrollsDocsSourceOptions<TDocument>
): DocsContentSource<TDocument> {
	const root = normalizeGlobPath(options.contentRoot);
	const documents = Object.entries(options.modules).map(([key, load]) => ({
		key: removeGlobRoot(key, root),
		metadata: options.metadata?.[key],
		load
	}));

	return createDocsContentSource({ config: options.config, documents });
}

function normalizeGlobPath(value: string): string {
	return value.replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/+$/, '');
}

function removeGlobRoot(key: string, root: string): string {
	const normalizedKey = key.replaceAll('\\', '/');
	const prefix = `${root}/`;
	if (!normalizedKey.startsWith(prefix)) {
		throw new Error(`Docs glob key "${key}" is outside configured contentRoot "${root}".`);
	}
	return normalizedKey.slice(prefix.length);
}

function resolvePublicationLayout(): string {
	// Keep the public entry browser-safe; hosts can provide an explicit layout when
	// their package manager needs a filesystem-resolved path.
	return '@acrolls/svelte/src/lib/PublicationLayout.svelte';
}

/**
 * mdsvex options with Acrolls layout default for SvelteKit hosts.
 */
export function createAcrollsSvelteKitMdsvexOptions(
  options: AcrollsMdsvexOptions = {}
) {
  const layout =
    options.layout ??
    ({
      _: resolvePublicationLayout()
    } as Record<string, string>);

  return createAcrollsMdsvexOptions({
    ...options,
    layout,
    extensions: options.extensions ?? ['.svx', '.md']
  });
}

/**
 * SvelteKit preprocessor with the shared layout default and Markdown source
 * safety normalization enabled before mdsvex parses the document.
 */
export function createAcrollsSvelteKitMdsvexPreprocessor(
	options: AcrollsMdsvexOptions = {}
) {
	return createAcrollsMdsvexPreprocessor({
		...options,
		layout: options.layout ?? { _: resolvePublicationLayout() },
		extensions: options.extensions ?? ['.svx', '.md']
	});
}

// Alias used in PRODUCT/TECH docs
export const createAcrollsKitOptions = createAcrollsSvelteKitMdsvexOptions;
