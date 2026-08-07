import type { DocsContentSource, DocsSourceDocument } from '@docs-kit/core';

import { fetchJson, type DocsFetchOptions } from './http.js';
import { sanitizeRemoteMarkdown } from './sanitize.js';

export interface SanitySourceOptions extends DocsFetchOptions {
	id?: string;
	projectId: string;
	dataset: string;
	/** GROQ query returning documents. Defaults to every `docsPage` ordered by slug. */
	query?: string;
	/** API version segment. Defaults to `2024-10-01`. */
	apiVersion?: string;
	/** Read token for private datasets. Never written to the cache. */
	token?: string;
	/** Use the CDN host for published content. Defaults to true when no token is set. */
	useCdn?: boolean;
	slugField?: string;
	titleField?: string;
	bodyField?: string;
	directory?: string;
	version?: string;
	locale?: string;
	priority?: number;
	namespace?: string;
}

interface SanityQueryResponse {
	result?: Array<Record<string, unknown>>;
}

function readString(document: Record<string, unknown>, field: string): string | undefined {
	const value = document[field];
	if (typeof value === 'string') {
		return value;
	}
	if (value !== null && typeof value === 'object' && 'current' in value) {
		const current = (value as { current?: unknown }).current;
		return typeof current === 'string' ? current : undefined;
	}
	return undefined;
}

function yamlString(value: string): string {
	return `'${value.replace(/'/g, "''")}'`;
}

/** Loads structured documents from a Sanity dataset with a configurable GROQ query. */
export function sanitySource(options: SanitySourceOptions): DocsContentSource {
	const {
		id,
		projectId,
		dataset,
		query = '*[_type == "docsPage"] | order(slug.current asc)',
		apiVersion = '2024-10-01',
		token,
		useCdn = token === undefined,
		slugField = 'slug',
		titleField = 'title',
		bodyField = 'body',
		directory = '',
		version,
		locale,
		priority,
		namespace,
		...fetchOptions
	} = options;
	const root = directory.split('/').filter(Boolean).join('/');

	return {
		id: id ?? `sanity:${projectId}`,
		type: 'sanity',
		...(priority === undefined ? {} : { priority }),
		...(namespace === undefined ? {} : { namespace }),
		async load(context) {
			const host = useCdn ? 'apicdn.sanity.io' : 'api.sanity.io';
			const url = `https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`;
			const response = await fetchJson<SanityQueryResponse>(url, {
				...fetchOptions,
				headers: {
					...(token ? { authorization: `Bearer ${token}` } : {}),
					...(fetchOptions.headers ?? {})
				},
				...(context.signal === undefined ? {} : { signal: context.signal })
			});

			return (response.result ?? []).flatMap((document): DocsSourceDocument[] => {
				const slug = readString(document, slugField);
				const body = readString(document, bodyField);
				if (!slug || body === undefined) {
					return [];
				}

				const title = readString(document, titleField);
				const frontmatter = title ? `---\ntitle: ${yamlString(title)}\n---\n\n` : '';
				const documentLocale = readString(document, 'locale') ?? locale;

				return [
					{
						relativePath: `${root === '' ? '' : `${root}/`}${slug.replace(/^\/+/, '')}.md`,
						content: sanitizeRemoteMarkdown(`${frontmatter}${body}`),
						origin: {
							url: `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`,
							...(typeof document['_id'] === 'string' ? { path: document['_id'] } : {}),
							...(typeof document['_updatedAt'] === 'string'
								? { lastModified: document['_updatedAt'] }
								: {})
						},
						...(version === undefined ? {} : { version }),
						...(documentLocale === undefined ? {} : { locale: documentLocale })
					}
				];
			});
		}
	};
}
