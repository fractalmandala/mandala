import type { DocsApiDocument } from './model.js';

export interface ScalarConfigurationOptions {
	/** URL the specification is served from, for example `/api/openapi.json`. */
	url?: string;
	/** The specification itself, when it is not served separately. */
	content?: unknown;
	/** Scalar theme id. Defaults to `none`, so the documentation theme's tokens apply. */
	theme?: string;
	/** Show the download button. Defaults to true. */
	showDownload?: boolean;
	/** Colour scheme the reference opens in. */
	darkMode?: boolean;
	/** Extra configuration merged last, for anything not modelled here. */
	extra?: Record<string, unknown>;
}

/**
 * Builds the configuration object `@scalar/api-reference` expects.
 *
 * Scalar itself is deliberately not a dependency: the embedded reference is installed with
 * `docs add api-reference`, which copies a component into the host project that imports
 * Scalar only if the host has it. This keeps the framework free of a browser bundle that
 * most documentation sites never load.
 */
export function createApiReferenceConfiguration(
	options: ScalarConfigurationOptions = {}
): Record<string, unknown> {
	if (options.url === undefined && options.content === undefined) {
		throw new Error('An API reference needs either a specification `url` or inline `content`.');
	}

	return {
		spec: {
			...(options.url === undefined ? {} : { url: options.url }),
			...(options.content === undefined ? {} : { content: options.content })
		},
		theme: options.theme ?? 'none',
		showSidebar: true,
		hideDownloadButton: options.showDownload === false,
		...(options.darkMode === undefined ? {} : { darkMode: options.darkMode }),
		...(options.extra ?? {})
	};
}

/** Summary of a parsed document, useful for a page that embeds the reference. */
export function describeApiDocument(document: DocsApiDocument): {
	title: string;
	version: string;
	operationCount: number;
	tagCount: number;
	schemaCount: number;
} {
	return {
		title: document.title,
		version: document.version,
		operationCount: document.operations.length + document.webhooks.length,
		tagCount: document.tags.length,
		schemaCount: document.schemas.length
	};
}
