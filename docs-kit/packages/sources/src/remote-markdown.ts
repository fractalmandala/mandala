import type { DocsContentSource, DocsSourceDocument } from '@docs-kit/core';

import { fetchText, type DocsFetchOptions } from './http.js';
import { sanitizeRemoteMarkdown, toMarkdownPath } from './sanitize.js';

export interface RemoteMarkdownDocument {
	/** Absolute HTTPS URL of the Markdown document. */
	url: string;
	/** Path relative to the source root; the `.md` extension is enforced. */
	path: string;
	version?: string;
	locale?: string;
}

export interface RemoteMarkdownSourceOptions extends DocsFetchOptions {
	id?: string;
	documents: readonly RemoteMarkdownDocument[];
	priority?: number;
	namespace?: string;
}

/** Loads individually addressed Markdown documents over HTTPS. */
export function remoteMarkdownSource(options: RemoteMarkdownSourceOptions): DocsContentSource {
	const { id, documents, priority, namespace, ...fetchOptions } = options;

	return {
		id: id ?? 'remote-markdown',
		type: 'remote-markdown',
		...(priority === undefined ? {} : { priority }),
		...(namespace === undefined ? {} : { namespace }),
		async load(context) {
			return Promise.all(
				documents.map(async (document): Promise<DocsSourceDocument> => {
					const content = await fetchText(document.url, {
						...fetchOptions,
						...(context.signal === undefined ? {} : { signal: context.signal })
					});

					return {
						relativePath: toMarkdownPath(document.path),
						content: sanitizeRemoteMarkdown(content),
						origin: { url: document.url },
						...(document.version === undefined ? {} : { version: document.version }),
						...(document.locale === undefined ? {} : { locale: document.locale })
					};
				})
			);
		}
	};
}
