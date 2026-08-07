import type { DocsContentSource, DocsSourceDocument } from '@docs-kit/core';

import { fetchJson, fetchText, DocsSourceFetchError, type DocsFetchOptions } from './http.js';
import { sanitizeRemoteMarkdown, toMarkdownPath } from './sanitize.js';

export interface GitHubSourceOptions extends DocsFetchOptions {
	id?: string;
	/** Repository in `owner/name` form. */
	repository: string;
	/** Branch, tag, or commit. Defaults to `main`. */
	ref?: string;
	/** Repository directory holding the documentation. Defaults to `docs`. */
	directory?: string;
	/** Personal access token. Sent only from the build process, never serialized. */
	token?: string;
	/** API origin, for GitHub Enterprise. Defaults to `https://api.github.com`. */
	apiUrl?: string;
	/** Raw content origin. Defaults to `https://raw.githubusercontent.com`. */
	rawUrl?: string;
	version?: string;
	locale?: string;
	priority?: number;
	namespace?: string;
}

interface GitHubTreeResponse {
	truncated?: boolean;
	tree?: Array<{ path?: string; type?: string }>;
}

const documentPattern = /\.(md|markdown|svx)$/i;

function assertRepository(repository: string): string {
	if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) {
		throw new Error(`Invalid GitHub repository "${repository}". Use the "owner/name" form.`);
	}
	return repository;
}

function normalizeDirectory(directory: string): string {
	return directory.split('/').filter(Boolean).join('/');
}

/** Loads a documentation directory from a GitHub repository tree. */
export function githubSource(options: GitHubSourceOptions): DocsContentSource {
	const {
		id,
		repository,
		ref = 'main',
		directory = 'docs',
		token,
		apiUrl = 'https://api.github.com',
		rawUrl = 'https://raw.githubusercontent.com',
		version,
		locale,
		priority,
		namespace,
		...fetchOptions
	} = options;
	const repo = assertRepository(repository);
	const root = normalizeDirectory(directory);
	const authHeaders = token ? { authorization: `Bearer ${token}` } : {};

	return {
		id: id ?? `github:${repo}`,
		type: 'github',
		...(priority === undefined ? {} : { priority }),
		...(namespace === undefined ? {} : { namespace }),
		async load(context) {
			const request: DocsFetchOptions = {
				...fetchOptions,
				headers: {
					'user-agent': 'docs-kit',
					...authHeaders,
					...(fetchOptions.headers ?? {})
				},
				...(context.signal === undefined ? {} : { signal: context.signal })
			};
			const treeUrl = `${apiUrl}/repos/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`;
			const tree = await fetchJson<GitHubTreeResponse>(treeUrl, request);

			if (tree.truncated) {
				throw new DocsSourceFetchError(
					`The tree for ${repo}@${ref} is truncated. Narrow the source to a smaller directory.`,
					treeUrl
				);
			}

			const prefix = root === '' ? '' : `${root}/`;
			const paths = (tree.tree ?? [])
				.filter((entry) => entry.type === 'blob' && typeof entry.path === 'string')
				.map((entry) => entry.path as string)
				.filter((path) => path.startsWith(prefix) && documentPattern.test(path))
				.sort();

			return Promise.all(
				paths.map(async (path): Promise<DocsSourceDocument> => {
					const url = `${rawUrl}/${repo}/${ref}/${path}`;
					const content = await fetchText(url, request);

					return {
						relativePath: toMarkdownPath(path.slice(prefix.length)),
						content: sanitizeRemoteMarkdown(content),
						origin: { url, repository: repo, ref, path },
						...(version === undefined ? {} : { version }),
						...(locale === undefined ? {} : { locale })
					};
				})
			);
		}
	};
}
