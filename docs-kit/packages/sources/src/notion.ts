import type { DocsContentSource, DocsSourceDocument } from '@docs-kit/core';

import { fetchJson, type DocsFetchOptions } from './http.js';
import { sanitizeRemoteMarkdown } from './sanitize.js';

export interface NotionSourceOptions extends DocsFetchOptions {
	id?: string;
	/** Integration token. Used only at build time and never written to the cache. */
	token: string;
	/** Database whose pages become documentation pages. */
	databaseId?: string;
	/** Explicit page ids, used when no database is configured. */
	pageIds?: readonly string[];
	/** Notion API version header. Defaults to `2022-06-28`. */
	notionVersion?: string;
	apiUrl?: string;
	/** Directory the generated pages are written to. Defaults to the source root. */
	directory?: string;
	/** Property holding the page slug. Defaults to `Slug`. */
	slugProperty?: string;
	/** Property holding the page title. Defaults to `Name`. */
	titleProperty?: string;
	version?: string;
	locale?: string;
	priority?: number;
	namespace?: string;
}

interface NotionRichText {
	plain_text?: string;
	href?: string | null;
	annotations?: { bold?: boolean; italic?: boolean; code?: boolean };
}

interface NotionBlock {
	id?: string;
	type?: string;
	has_children?: boolean;
	[key: string]: unknown;
}

interface NotionPage {
	id?: string;
	url?: string;
	last_edited_time?: string;
	properties?: Record<string, unknown>;
}

interface NotionList<T> {
	results?: T[];
	next_cursor?: string | null;
	has_more?: boolean;
}

function richText(nodes: readonly NotionRichText[] | undefined): string {
	return (nodes ?? [])
		.map((node) => {
			let text = node.plain_text ?? '';
			if (node.annotations?.code) {
				text = `\`${text}\``;
			}
			if (node.annotations?.bold) {
				text = `**${text}**`;
			}
			if (node.annotations?.italic) {
				text = `_${text}_`;
			}
			return node.href ? `[${text}](${node.href})` : text;
		})
		.join('');
}

function blockText(block: NotionBlock): readonly NotionRichText[] | undefined {
	const payload = block[block.type ?? ''] as { rich_text?: NotionRichText[] } | undefined;
	return payload?.rich_text;
}

/** Converts the block types documentation pages actually use into Markdown. */
export function notionBlocksToMarkdown(blocks: readonly NotionBlock[]): string {
	const lines: string[] = [];

	for (const block of blocks) {
		const text = richText(blockText(block));

		switch (block.type) {
			case 'heading_1':
				lines.push(`# ${text}`, '');
				break;
			case 'heading_2':
				lines.push(`## ${text}`, '');
				break;
			case 'heading_3':
				lines.push(`### ${text}`, '');
				break;
			case 'bulleted_list_item':
				lines.push(`- ${text}`);
				break;
			case 'numbered_list_item':
				lines.push(`1. ${text}`);
				break;
			case 'to_do': {
				const checked = (block['to_do'] as { checked?: boolean } | undefined)?.checked;
				lines.push(`- [${checked ? 'x' : ' '}] ${text}`);
				break;
			}
			case 'quote':
				lines.push(`> ${text}`, '');
				break;
			case 'code': {
				const language = (block['code'] as { language?: string } | undefined)?.language ?? '';
				lines.push(`\`\`\`${language}`, text, '```', '');
				break;
			}
			case 'divider':
				lines.push('---', '');
				break;
			case 'image': {
				const image = block['image'] as
					| { external?: { url?: string }; file?: { url?: string }; caption?: NotionRichText[] }
					| undefined;
				const url = image?.external?.url ?? image?.file?.url;
				if (url) {
					lines.push(`![${richText(image?.caption)}](${url})`, '');
				}
				break;
			}
			case 'paragraph':
				lines.push(text, '');
				break;
			default:
				if (text) {
					lines.push(text, '');
				}
				break;
		}
	}

	return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

function propertyText(property: unknown): string | undefined {
	if (property === null || typeof property !== 'object') {
		return undefined;
	}

	const value = property as {
		type?: string;
		title?: NotionRichText[];
		rich_text?: NotionRichText[];
		url?: string | null;
	};

	if (value.type === 'title') {
		return richText(value.title) || undefined;
	}
	if (value.type === 'rich_text') {
		return richText(value.rich_text) || undefined;
	}
	if (value.type === 'url') {
		return value.url ?? undefined;
	}

	return undefined;
}

function yamlString(value: string): string {
	return `'${value.replace(/'/g, "''")}'`;
}

/** Maps Notion pages to documentation pages through the public Notion API. */
export function notionSource(options: NotionSourceOptions): DocsContentSource {
	const {
		id,
		token,
		databaseId,
		pageIds = [],
		notionVersion = '2022-06-28',
		apiUrl = 'https://api.notion.com/v1',
		directory = '',
		slugProperty = 'Slug',
		titleProperty = 'Name',
		version,
		locale,
		priority,
		namespace,
		...fetchOptions
	} = options;

	if (!databaseId && pageIds.length === 0) {
		throw new Error('A Notion source requires either `databaseId` or `pageIds`.');
	}

	const root = directory.split('/').filter(Boolean).join('/');

	return {
		id: id ?? 'notion',
		type: 'notion',
		...(priority === undefined ? {} : { priority }),
		...(namespace === undefined ? {} : { namespace }),
		async load(context) {
			const request: DocsFetchOptions = {
				...fetchOptions,
				headers: {
					authorization: `Bearer ${token}`,
					'notion-version': notionVersion,
					...(fetchOptions.headers ?? {})
				},
				...(context.signal === undefined ? {} : { signal: context.signal })
			};

			const pages: NotionPage[] = databaseId
				? (
						await fetchJson<NotionList<NotionPage>>(
							`${apiUrl}/databases/${databaseId}/query`,
							request
						)
					).results ?? []
				: await Promise.all(
						pageIds.map((pageId) => fetchJson<NotionPage>(`${apiUrl}/pages/${pageId}`, request))
					);

			return Promise.all(
				pages.map(async (page): Promise<DocsSourceDocument> => {
					const blocks =
						(await fetchJson<NotionList<NotionBlock>>(
							`${apiUrl}/blocks/${page.id}/children?page_size=100`,
							request
						)).results ?? [];
					const title = propertyText(page.properties?.[titleProperty]) ?? page.id ?? 'Untitled';
					const slug =
						propertyText(page.properties?.[slugProperty]) ??
						title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ??
						page.id;
					const body = notionBlocksToMarkdown(blocks);
					const frontmatter = `---\ntitle: ${yamlString(title)}\n---\n\n`;

					return {
						relativePath: `${root === '' ? '' : `${root}/`}${slug || page.id}.md`,
						content: sanitizeRemoteMarkdown(`${frontmatter}${body}`),
						origin: {
							...(page.url === undefined ? {} : { url: page.url }),
							...(page.last_edited_time === undefined
								? {}
								: { lastModified: page.last_edited_time }),
							...(page.id === undefined ? {} : { path: page.id })
						},
						...(version === undefined ? {} : { version }),
						...(locale === undefined ? {} : { locale })
					};
				})
			);
		}
	};
}
