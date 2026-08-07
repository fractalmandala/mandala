import { describe, expect, it } from 'vitest';

import {
	createAskPrompt,
	createDocsAskPipeline,
	renderAskAnswerLinks,
	usedAskCitations
} from './ask.js';
import { chunkDocsDocument, chunkDocsDocuments } from './chunks.js';
import { createDocsAiDocument, filterDocsAiDocuments } from './documents.js';
import {
	createLlmsFullTxt,
	createLlmsFullTxtParts,
	createLlmsTxt,
	createRawMarkdown
} from './llms.js';
import { createEmbeddingRetriever, createLexicalRetriever } from './retrieval.js';

import type { DocsAskProvider } from './ask.js';

const installSource = [
	'---',
	'title: Installation',
	'description: Install the framework.',
	'---',
	'',
	'# Installation',
	'',
	'Install with your package manager.',
	'',
	'## Deployment',
	'',
	'Deploy to Vercel with the Vercel adapter.',
	'',
	'## Troubleshooting',
	'',
	'Clear the cache when a build fails.'
].join('\n');

const documents = [
	createDocsAiDocument({
		id: 'install.md',
		pathname: '/docs/install',
		source: installSource,
		siteUrl: 'https://acme.com'
	}),
	createDocsAiDocument({
		id: 'internal.md',
		pathname: '/docs/internal',
		source: '---\ntitle: Internal\ndraft: true\n---\n\n# Internal\n\nSecret deployment runbook.',
		siteUrl: 'https://acme.com'
	}),
	createDocsAiDocument({
		id: 'partners.md',
		pathname: '/docs/partners',
		source: '# Partners\n\nPartner-only deployment notes.',
		audiences: ['partners']
	})
];

describe('createDocsAiDocument', () => {
	it('reads frontmatter, headings, and canonical URLs', () => {
		expect(documents[0]).toMatchObject({
			title: 'Installation',
			description: 'Install the framework.',
			pathname: '/docs/install',
			url: 'https://acme.com/docs/install'
		});
		expect(documents[0]?.headings.map((heading) => heading.id)).toEqual([
			'installation',
			'deployment',
			'troubleshooting'
		]);
		expect(documents[1]?.hidden).toBe(true);
	});
});

describe('filterDocsAiDocuments', () => {
	it('hides drafts and audience-restricted pages by default', () => {
		expect(filterDocsAiDocuments(documents).map((document) => document.id)).toEqual(['install.md']);
		expect(
			filterDocsAiDocuments(documents, { includeHidden: true, audiences: ['partners'] }).map(
				(document) => document.id
			)
		).toEqual(['install.md', 'internal.md', 'partners.md']);
	});

	it('filters by version and locale', () => {
		const versioned = [
			createDocsAiDocument({ id: 'a.md', pathname: '/docs/a', source: '# A', version: 'v2', locale: 'en' }),
			createDocsAiDocument({ id: 'b.md', pathname: '/docs/b', source: '# B', version: 'v1', locale: 'de' })
		];

		expect(filterDocsAiDocuments(versioned, { version: 'v2' }).map((entry) => entry.id)).toEqual([
			'a.md'
		]);
		expect(filterDocsAiDocuments(versioned, { locale: 'de' }).map((entry) => entry.id)).toEqual([
			'b.md'
		]);
	});
});

describe('chunkDocsDocument', () => {
	it('produces heading-scoped chunks with citable anchors', () => {
		const chunks = chunkDocsDocument(documents[0]!);

		expect(chunks.map((chunk) => chunk.anchor)).toEqual([
			'installation',
			'deployment',
			'troubleshooting'
		]);
		expect(chunks[1]).toMatchObject({
			pathname: '/docs/install#deployment',
			url: 'https://acme.com/docs/install#deployment',
			headingPath: ['Installation', 'Deployment']
		});
	});

	it('splits oversized sections on paragraph boundaries', () => {
		const long = createDocsAiDocument({
			id: 'long.md',
			pathname: '/docs/long',
			source: `# Long\n\n${Array.from({ length: 8 }, (_value, index) => `Paragraph ${index} ${'word '.repeat(40)}`).join('\n\n')}`
		});
		const chunks = chunkDocsDocument(long, { maxCharacters: 400, overlap: 0 });

		expect(chunks.length).toBeGreaterThan(1);
		expect(chunks.every((chunk) => chunk.anchor === 'long')).toBe(true);
	});
});

describe('createLexicalRetriever', () => {
	const retriever = createLexicalRetriever(chunkDocsDocuments(filterDocsAiDocuments(documents)));

	it('ranks the matching section first', async () => {
		const results = await retriever.retrieve('how do I deploy to Vercel?');

		expect(results[0]?.chunk.anchor).toBe('deployment');
		expect(results[0]?.excerpt).toContain('Vercel');
	});

	it('returns nothing for a query with no usable terms', async () => {
		expect(await retriever.retrieve('the and of')).toEqual([]);
	});

	it('respects version filters', async () => {
		const versioned = createLexicalRetriever(
			chunkDocsDocuments([
				createDocsAiDocument({ id: 'v2.md', pathname: '/docs/v2', source: '# Deploy\n\nVercel v2.', version: 'v2' }),
				createDocsAiDocument({ id: 'v1.md', pathname: '/docs/v1', source: '# Deploy\n\nVercel v1.', version: 'v1' })
			])
		);

		const results = await versioned.retrieve('vercel', { filter: { version: 'v1' } });
		expect(results.map((result) => result.chunk.documentId)).toEqual(['v1.md']);
	});
});

describe('createEmbeddingRetriever', () => {
	it('ranks by cosine similarity and embeds chunks only once', async () => {
		const chunks = chunkDocsDocuments(filterDocsAiDocuments(documents));
		let calls = 0;
		const provider = {
			name: 'test',
			async embed(inputs: readonly string[]) {
				calls += 1;
				return inputs.map((input) => [input.includes('Vercel') ? 1 : 0, input.includes('cache') ? 1 : 0]);
			}
		};
		const retriever = createEmbeddingRetriever(chunks, provider);

		expect((await retriever.retrieve('Vercel'))[0]?.chunk.anchor).toBe('deployment');
		await retriever.retrieve('Vercel');
		expect(calls).toBe(3);
		expect(retriever.name).toBe('embedding:test');
	});
});

describe('createDocsAskPipeline', () => {
	const retriever = createLexicalRetriever(chunkDocsDocuments(documents));

	function provider(text: string, stream = false): DocsAskProvider {
		return {
			name: 'test-provider',
			answer: stream
				? async function* () {
						for (const part of text.split(' ')) {
							yield `${part} `;
						}
					}
				: async () => text
		};
	}

	it('answers with only the citations the answer referenced', async () => {
		const pipeline = createDocsAskPipeline({
			retriever,
			provider: provider('Use the Vercel adapter [1].')
		});
		const answer = await pipeline.ask('how do I deploy?');

		expect(answer.provider).toBe('test-provider');
		expect(answer.citations).toHaveLength(1);
		expect(answer.citations[0]).toMatchObject({
			marker: 1,
			pathname: '/docs/install#deployment',
			url: 'https://acme.com/docs/install#deployment'
		});
		expect(renderAskAnswerLinks(answer)).toBe(
			'Use the Vercel adapter [[1]](https://acme.com/docs/install#deployment).'
		);
	});

	it('never passes unauthorized context to the provider', async () => {
		let seen: string[] = [];
		const pipeline = createDocsAskPipeline({
			retriever,
			authorize: (chunk) => chunk.documentId !== 'internal.md',
			provider: {
				name: 'inspecting',
				answer: async (request) => {
					seen = request.chunks.map((chunk) => chunk.documentId);
					return 'ok';
				}
			}
		});

		await pipeline.ask('deployment runbook');
		expect(seen).not.toContain('internal.md');
	});

	it('streams deltas and resolves the final answer', async () => {
		const deltas: string[] = [];
		const pipeline = createDocsAskPipeline({
			retriever,
			provider: provider('Deploy with Vercel [1].', true)
		});
		const answer = await pipeline.stream('deploy', (delta) => deltas.push(delta));

		expect(deltas.length).toBeGreaterThan(1);
		expect(answer.text.trim()).toBe('Deploy with Vercel [1].');
	});

	it('builds a grounded prompt that refuses to guess', async () => {
		const pipeline = createDocsAskPipeline({
			retriever,
			provider: {
				name: 'prompting',
				answer: async (request) => createAskPrompt(request)
			}
		});
		const answer = await pipeline.ask('how do I deploy?');

		expect(answer.text).toContain('using only the documentation excerpts');
		expect(answer.text).toContain('[1] Installation > Deployment (https://acme.com/docs/install#deployment)');
		expect(answer.text).toContain('Question: how do I deploy?');
	});

	it('leaves markers without a matching citation untouched', () => {
		const citations = [
			{
				marker: 1,
				title: 'A',
				headingPath: ['A'],
				pathname: '/docs/a',
				excerpt: '',
				chunkId: 'a#0'
			}
		];

		expect(usedAskCitations('See [2].', citations)).toEqual([]);
		expect(
			renderAskAnswerLinks({ text: 'See [2].', citations, provider: 'test' })
		).toBe('See [2].');
	});
});

describe('llms.txt', () => {
	const site = { title: 'Acme', description: 'Acme documentation.', url: 'https://acme.com' };
	const llmsDocuments = [
		createDocsAiDocument({
			id: 'index.md',
			pathname: '/docs',
			source: '---\ntitle: Introduction\ndescription: Start here.\n---\n\nWelcome.',
			siteUrl: site.url
		}),
		createDocsAiDocument({
			id: 'guides/deploy.md',
			pathname: '/docs/guides/deploy',
			source: '---\ntitle: Deployment\n---\n\n# Deployment\n\nShip it.',
			siteUrl: site.url
		}),
		createDocsAiDocument({
			id: 'draft.md',
			pathname: '/docs/draft',
			source: '---\ntitle: Draft\ndraft: true\n---\n\nUnpublished.',
			siteUrl: site.url
		})
	];

	it('lists pages grouped by section with absolute links', () => {
		const txt = createLlmsTxt(llmsDocuments, { site });

		expect(txt.startsWith('# Acme\n\n> Acme documentation.')).toBe(true);
		expect(txt).toContain('## Overview');
		expect(txt).toContain('## Guides');
		expect(txt).toContain(
			'- [Introduction](https://acme.com/docs) ([Markdown](https://acme.com/docs.md)): Start here.'
		);
		expect(txt).not.toContain('Draft');
	});

	it('supports explicit sections, optional links, and omitting raw links', () => {
		const txt = createLlmsTxt(llmsDocuments, {
			site,
			rawMarkdown: false,
			sections: [{ label: 'Guides', prefix: '/docs/guides' }],
			optional: [{ label: 'Repository', href: 'https://github.com/acme/product' }]
		});

		expect(txt).toContain('## Guides\n\n- [Deployment](https://acme.com/docs/guides/deploy)');
		expect(txt).toContain('## Other');
		expect(txt).toContain('## Optional\n\n- [Repository](https://github.com/acme/product)');
		expect(txt).not.toContain('Markdown]');
	});

	it('is deterministic and filterable by dimension', () => {
		expect(createLlmsTxt(llmsDocuments, { site })).toBe(createLlmsTxt(llmsDocuments, { site }));
		expect(
			createLlmsTxt(llmsDocuments, { site, filter: { includeHidden: true } })
		).toContain('Draft');
	});
});

describe('llms-full.txt', () => {
	const site = { title: 'Acme', url: 'https://acme.com' };
	const fullDocuments = [
		createDocsAiDocument({
			id: 'a.md',
			pathname: '/docs/a',
			source: '---\ntitle: A\n---\n\n' + 'a'.repeat(400),
			siteUrl: site.url
		}),
		createDocsAiDocument({
			id: 'b.md',
			pathname: '/docs/b',
			source: '---\ntitle: B\n---\n\n' + 'b'.repeat(400),
			siteUrl: site.url,
			version: 'v2'
		})
	];

	it('concatenates every page with its source URL', () => {
		const txt = createLlmsFullTxt(fullDocuments, { site });

		expect(txt).toContain('Source: https://acme.com/docs/a');
		expect(txt).toContain('Version: v2');
		expect(txt.indexOf('/docs/a')).toBeLessThan(txt.indexOf('/docs/b'));
	});

	it('partitions large sites without splitting a page', () => {
		const parts = createLlmsFullTxtParts(fullDocuments, { site, maxCharacters: 500 });

		expect(parts).toHaveLength(2);
		expect(parts.every((part) => part.parts === 2)).toBe(true);
		expect(parts[0]?.pageIds).toEqual(['a.md']);
		expect(parts[1]?.pageIds).toEqual(['b.md']);
	});

	it('produces one empty part for an empty documentation set', () => {
		expect(createLlmsFullTxtParts([], { site })).toHaveLength(1);
	});
});

describe('createRawMarkdown', () => {
	it('serves the page body with its canonical source', () => {
		const raw = createRawMarkdown(
			createDocsAiDocument({
				id: 'a.md',
				pathname: '/docs/a',
				source: '---\ntitle: A\n---\n\nBody.',
				siteUrl: 'https://acme.com'
			})
		);

		expect(raw).toBe('<!-- Source: https://acme.com/docs/a -->\n\n# A\n\nBody.\n');
	});

	it('does not repeat a title the document already writes', () => {
		const raw = createRawMarkdown(
			createDocsAiDocument({
				id: 'b.md',
				pathname: '/docs/b',
				source: '---\ntitle: B\n---\n\n# B\n\nBody.',
				siteUrl: 'https://acme.com'
			})
		);

		expect(raw).toBe('<!-- Source: https://acme.com/docs/b -->\n\n# B\n\nBody.\n');
	});
});
