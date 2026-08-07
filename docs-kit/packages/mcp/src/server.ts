import { splitDocsSections } from '@docs-kit/core';
import {
	chunkDocsDocuments,
	createLexicalRetriever,
	filterDocsAiDocuments,
	type DocsAiDocument,
	type DocsAiFilter,
	type DocsAiRetriever
} from '@docs-kit/ai';

export interface DocsMcpServerOptions {
	/** The same documents the website renders, so both surfaces cannot drift apart. */
	documents: readonly DocsAiDocument[];
	/** Site metadata reported during initialization. */
	site?: { title?: string; url?: string };
	versions?: readonly { id: string; label: string; current: boolean }[];
	locales?: readonly { id: string; label: string; default: boolean }[];
	/** Retriever used by `search_docs`. Defaults to the built-in lexical retriever. */
	retriever?: DocsAiRetriever;
	/**
	 * Per-request access filter. It receives the caller-supplied filter and returns the
	 * effective one, so hosts can pin audiences for an authenticated session.
	 */
	authorize?: (filter: DocsAiFilter) => DocsAiFilter;
	serverName?: string;
	serverVersion?: string;
}

export interface JsonRpcRequest {
	jsonrpc: '2.0';
	id?: string | number | null;
	method: string;
	params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
	jsonrpc: '2.0';
	id: string | number | null;
	result?: unknown;
	error?: { code: number; message: string };
}

export interface DocsMcpTool {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
}

export interface DocsMcpServer {
	tools: DocsMcpTool[];
	/** Handles one JSON-RPC message. Returns undefined for notifications. */
	handle(request: JsonRpcRequest): Promise<JsonRpcResponse | undefined>;
	/** Calls a tool directly, which is what the JSON-RPC layer does internally. */
	callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
}

const protocolVersion = '2024-11-05';

function stringArg(args: Record<string, unknown>, name: string): string | undefined {
	const value = args[name];
	return typeof value === 'string' && value !== '' ? value : undefined;
}

function numberArg(args: Record<string, unknown>, name: string): number | undefined {
	const value = args[name];
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function filterFromArgs(args: Record<string, unknown>): DocsAiFilter {
	return {
		...(stringArg(args, 'version') === undefined ? {} : { version: stringArg(args, 'version') as string }),
		...(stringArg(args, 'locale') === undefined ? {} : { locale: stringArg(args, 'locale') as string })
	};
}

const tools: DocsMcpTool[] = [
	{
		name: 'list_pages',
		description: 'List documentation pages, optionally filtered by version and locale.',
		inputSchema: {
			type: 'object',
			properties: {
				version: { type: 'string' },
				locale: { type: 'string' },
				prefix: { type: 'string', description: 'Only pages whose pathname starts with this value.' }
			}
		}
	},
	{
		name: 'search_docs',
		description: 'Search documentation and return matching sections with their anchors.',
		inputSchema: {
			type: 'object',
			properties: {
				query: { type: 'string' },
				limit: { type: 'number' },
				version: { type: 'string' },
				locale: { type: 'string' }
			},
			required: ['query']
		}
	},
	{
		name: 'read_page',
		description: 'Read one documentation page as Markdown.',
		inputSchema: {
			type: 'object',
			properties: {
				pathname: { type: 'string' },
				id: { type: 'string' },
				version: { type: 'string' },
				locale: { type: 'string' }
			}
		}
	},
	{
		name: 'read_section',
		description: 'Read a single section of a page by its heading anchor.',
		inputSchema: {
			type: 'object',
			properties: {
				pathname: { type: 'string' },
				anchor: { type: 'string' },
				version: { type: 'string' },
				locale: { type: 'string' }
			},
			required: ['anchor']
		}
	},
	{
		name: 'list_versions',
		description: 'List the documentation versions available.',
		inputSchema: { type: 'object', properties: {} }
	},
	{
		name: 'list_locales',
		description: 'List the documentation locales available.',
		inputSchema: { type: 'object', properties: {} }
	}
];

/**
 * A transport-independent MCP server over the documentation manifest.
 *
 * It implements the JSON-RPC subset MCP clients need (`initialize`, `tools/list`,
 * `tools/call`, `ping`) without a protocol dependency, and every tool reads the same
 * documents the website renders.
 */
export function createDocsMcpServer(options: DocsMcpServerOptions): DocsMcpServer {
	const authorize = options.authorize ?? ((filter: DocsAiFilter) => filter);
	const visible = (filter: DocsAiFilter): DocsAiDocument[] =>
		filterDocsAiDocuments(options.documents, authorize(filter));
	const retriever =
		options.retriever ??
		createLexicalRetriever(chunkDocsDocuments(filterDocsAiDocuments(options.documents, authorize({}))));

	function findDocument(
		args: Record<string, unknown>
	): DocsAiDocument | undefined {
		const documents = visible(filterFromArgs(args));
		const pathname = stringArg(args, 'pathname');
		const id = stringArg(args, 'id');

		return documents.find(
			(document) =>
				(id !== undefined && document.id === id) ||
				(pathname !== undefined &&
					document.pathname.replace(/\/+$/, '') === pathname.replace(/\/+$/, ''))
		);
	}

	async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
		switch (name) {
			case 'list_pages': {
				const prefix = stringArg(args, 'prefix');
				return visible(filterFromArgs(args))
					.filter((document) => prefix === undefined || document.pathname.startsWith(prefix))
					.map((document) => ({
						id: document.id,
						title: document.title,
						pathname: document.pathname,
						...(document.description === undefined ? {} : { description: document.description }),
						...(document.url === undefined ? {} : { url: document.url }),
						...(document.version === undefined ? {} : { version: document.version }),
						...(document.locale === undefined ? {} : { locale: document.locale })
					}));
			}

			case 'search_docs': {
				const query = stringArg(args, 'query');
				if (query === undefined) {
					throw new Error('search_docs requires a "query" argument.');
				}

				const results = await retriever.retrieve(query, {
					limit: numberArg(args, 'limit') ?? 8,
					filter: authorize(filterFromArgs(args))
				});

				return results.map((result) => ({
					title: result.chunk.title,
					headingPath: result.chunk.headingPath,
					pathname: result.chunk.pathname,
					...(result.chunk.url === undefined ? {} : { url: result.chunk.url }),
					excerpt: result.excerpt,
					score: Number(result.score.toFixed(4))
				}));
			}

			case 'read_page': {
				const document = findDocument(args);
				if (!document) {
					throw new Error('No documentation page matched the requested page.');
				}

				return {
					id: document.id,
					title: document.title,
					pathname: document.pathname,
					...(document.url === undefined ? {} : { url: document.url }),
					headings: document.headings.map((heading) => ({
						id: heading.id,
						text: heading.text,
						depth: heading.depth
					})),
					markdown: document.body
				};
			}

			case 'read_section': {
				const anchor = stringArg(args, 'anchor');
				const document = findDocument(args);
				if (!document) {
					throw new Error('No documentation page matched the requested page.');
				}

				const section = splitDocsSections(document.body).find(
					(entry) => entry.heading?.id === anchor
				);
				if (!section) {
					throw new Error(`Page "${document.pathname}" has no section anchored at "${anchor}".`);
				}

				return {
					pathname: `${document.pathname}#${anchor}`,
					...(document.url === undefined ? {} : { url: `${document.url}#${anchor}` }),
					heading: section.heading?.text,
					headingPath: [document.title, ...section.path],
					markdown: section.content
				};
			}

			case 'list_versions':
				return options.versions ?? [];

			case 'list_locales':
				return options.locales ?? [];

			default:
				throw new Error(`Unknown tool "${name}".`);
		}
	}

	return {
		tools,
		callTool,
		async handle(request) {
			const id = request.id ?? null;
			const respond = (result: unknown): JsonRpcResponse => ({ jsonrpc: '2.0', id, result });

			try {
				switch (request.method) {
					case 'initialize':
						return respond({
							protocolVersion,
							capabilities: { tools: {} },
							serverInfo: {
								name: options.serverName ?? options.site?.title ?? 'docs-kit',
								version: options.serverVersion ?? '0.0.0'
							}
						});

					case 'ping':
						return respond({});

					case 'tools/list':
						return respond({ tools });

					case 'tools/call': {
						const name = typeof request.params?.['name'] === 'string' ? request.params['name'] : '';
						const args =
							request.params?.['arguments'] !== null &&
							typeof request.params?.['arguments'] === 'object'
								? (request.params['arguments'] as Record<string, unknown>)
								: {};
						const result = await callTool(name, args);

						return respond({
							content: [{ type: 'text', text: JSON.stringify(result, null, '\t') }],
							structuredContent: result
						});
					}

					default:
						if (request.id === undefined) {
							return undefined;
						}
						return {
							jsonrpc: '2.0',
							id,
							error: { code: -32601, message: `Unknown method "${request.method}".` }
						};
				}
			} catch (error) {
				return {
					jsonrpc: '2.0',
					id,
					error: {
						code: -32000,
						message: error instanceof Error ? error.message : String(error)
					}
				};
			}
		}
	};
}
