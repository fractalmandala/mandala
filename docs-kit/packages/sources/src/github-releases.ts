import type { DocsContentSource, DocsSourceDocument } from '@docs-kit/core';

import { fetchJson, type DocsFetchOptions } from './http.js';
import { sanitizeRemoteMarkdown } from './sanitize.js';

export interface GitHubReleasesSourceOptions extends DocsFetchOptions {
	id?: string;
	repository: string;
	token?: string;
	apiUrl?: string;
	/** Directory the generated release pages are written to. Defaults to `releases`. */
	directory?: string;
	/** Maximum number of releases to import. Defaults to 30. */
	limit?: number;
	/** Include draft and prerelease entries. Defaults to false. */
	includeUnpublished?: boolean;
	/** Emit an index page listing every imported release. Defaults to true. */
	index?: boolean;
	version?: string;
	locale?: string;
	priority?: number;
	namespace?: string;
}

interface GitHubRelease {
	tag_name?: string;
	name?: string | null;
	body?: string | null;
	html_url?: string;
	draft?: boolean;
	prerelease?: boolean;
	published_at?: string | null;
}

function slugifyTag(tag: string): string {
	const slug = tag
		.toLowerCase()
		.replace(/[^a-z0-9.]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug === '' ? 'release' : slug;
}

function yamlString(value: string): string {
	return `'${value.replace(/'/g, "''")}'`;
}

function releasePage(release: GitHubRelease, tag: string): string {
	const title = release.name?.trim() || tag;
	const frontmatter = [
		'---',
		`title: ${yamlString(title)}`,
		`label: ${yamlString(tag)}`,
		...(release.published_at ? [`date: ${yamlString(release.published_at)}`] : []),
		...(release.prerelease ? ['badge: Prerelease'] : []),
		...(release.html_url ? [`sourceUrl: ${yamlString(release.html_url)}`] : []),
		'---',
		''
	];
	const body = sanitizeRemoteMarkdown(release.body?.trim() || '_No release notes were provided._');

	return `${frontmatter.join('\n')}\n# ${title}\n\n${body}\n`;
}

function indexPage(releases: readonly GitHubRelease[], directory: string, repository: string): string {
	const rows = releases.map((release) => {
		const tag = release.tag_name ?? '';
		const title = release.name?.trim() || tag;
		const date = release.published_at?.slice(0, 10) ?? '';
		return `- [${title}](/${directory}/${slugifyTag(tag)})${date ? ` — ${date}` : ''}`;
	});

	return `---\ntitle: 'Releases'\n---\n\n# Releases\n\nRelease notes imported from ${repository}.\n\n${rows.join('\n')}\n`;
}

/** Generates release-note pages from a repository's published GitHub releases. */
export function githubReleasesSource(options: GitHubReleasesSourceOptions): DocsContentSource {
	const {
		id,
		repository,
		token,
		apiUrl = 'https://api.github.com',
		directory = 'releases',
		limit = 30,
		includeUnpublished = false,
		index = true,
		version,
		locale,
		priority,
		namespace,
		...fetchOptions
	} = options;
	const root = directory.split('/').filter(Boolean).join('/');

	return {
		id: id ?? `github-releases:${repository}`,
		type: 'github-releases',
		...(priority === undefined ? {} : { priority }),
		...(namespace === undefined ? {} : { namespace }),
		async load(context) {
			const url = `${apiUrl}/repos/${repository}/releases?per_page=${Math.min(Math.max(limit, 1), 100)}`;
			const releases = await fetchJson<GitHubRelease[]>(url, {
				...fetchOptions,
				headers: {
					'user-agent': 'docs-kit',
					...(token ? { authorization: `Bearer ${token}` } : {}),
					...(fetchOptions.headers ?? {})
				},
				...(context.signal === undefined ? {} : { signal: context.signal })
			});

			const selected = (Array.isArray(releases) ? releases : [])
				.filter((release) => typeof release.tag_name === 'string' && release.tag_name !== '')
				.filter((release) => includeUnpublished || (!release.draft && !release.prerelease))
				.slice(0, limit);

			const documents = selected.map((release): DocsSourceDocument => {
				const tag = release.tag_name as string;

				return {
					relativePath: `${root}/${slugifyTag(tag)}.md`,
					content: releasePage(release, tag),
					origin: {
						repository,
						...(release.html_url === undefined ? {} : { url: release.html_url }),
						...(release.published_at ? { lastModified: release.published_at } : {})
					},
					...(version === undefined ? {} : { version }),
					...(locale === undefined ? {} : { locale })
				};
			});

			if (index && documents.length > 0) {
				documents.unshift({
					relativePath: `${root}/index.md`,
					content: indexPage(selected, root, repository),
					origin: { repository },
					...(version === undefined ? {} : { version }),
					...(locale === undefined ? {} : { locale })
				});
			}

			return documents;
		}
	};
}
