import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
	createDocsSearchRecords,
	toSearchableText,
	type DocsManifestPage,
	type DocsSearchRecord
} from '@docs-kit/core';

import { flexSearchProvider } from './flexsearch.js';
import { oramaProvider } from './orama.js';
import { pagefindProvider, type PagefindBundle } from './pagefind.js';
import { createDocsSearch } from './registry.js';
import { groupSearchResults, highlightMatches } from './highlight.js';
import { createRecentSearches } from './recent.js';
import { createFlexSearchClient } from './client.js';
import { createExcerpt, matchesSearchFilter, type DocsSearchProvider } from './provider.js';

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function manifestPage(overrides: Partial<DocsManifestPage> & { id: string }): DocsManifestPage {
	const slug = overrides.id.replace(/\.md$/, '');

	return {
		source: { relativePath: overrides.id, extension: '.md' },
		slug,
		slugSegments: slug.split('/'),
		pathname: `/docs/${slug}`,
		title: overrides.title ?? slug,
		label: overrides.label ?? overrides.title ?? slug,
		frontmatter: {},
		headings: [],
		...overrides
	};
}

const sources = new Map([
	[
		'deployment.md',
		[
			'---',
			'title: Deployment',
			'tags: [ops]',
			'---',
			'',
			'# Deployment',
			'',
			'Deploy the documentation to any static host.',
			'',
			'## Vercel',
			'',
			'Install the Vercel adapter and run the build.',
			'',
			'```bash',
			'pnpm add -D @sveltejs/adapter-vercel',
			'```',
			'',
			'## Troubleshooting',
			'',
			'Clear the cache when a build fails.'
		].join('\n')
	],
	[
		'styling.md',
		'---\ntitle: Styling\n---\n\n# Styling\n\nOverride theme tokens to inherit host branding.'
	],
	['secret.md', '---\ntitle: Secret\ndraft: true\n---\n\n# Secret\n\nInternal deployment notes.']
]);

const pages = [
	manifestPage({ id: 'deployment.md', title: 'Deployment', frontmatter: { tags: ['ops'] } }),
	manifestPage({ id: 'styling.md', title: 'Styling', locale: 'en' }),
	manifestPage({ id: 'secret.md', title: 'Secret', draft: true })
];

const records = createDocsSearchRecords(pages, { sources });

/** A stub of the Pagefind runtime API, so the adapter is exercised without a built site. */
function pagefindBundle(indexed: readonly DocsSearchRecord[]): PagefindBundle {
	return {
		async search(query) {
			const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
			const matches = indexed.filter((record) =>
				terms.some((term) =>
					`${record.title} ${record.section ?? ''} ${record.body}`.toLowerCase().includes(term)
				)
			);

			return {
				results: matches.map((record) => ({
					id: record.id,
					data: async () => ({
						url: record.pathname,
						meta: { title: record.title },
						excerpt: record.body.slice(0, 80)
					})
				}))
			};
		}
	};
}

const providers: Array<{ name: string; provider: DocsSearchProvider }> = [
	{ name: 'flexsearch', provider: flexSearchProvider() },
	{ name: 'orama', provider: oramaProvider() },
	{
		name: 'pagefind',
		provider: pagefindProvider({
			records,
			loadBundle: async () => pagefindBundle(records)
		})
	}
];

describe('createDocsSearchRecords', () => {
	it('indexes a record per page and per section, skipping drafts', () => {
		expect(records.map((record) => record.id)).toEqual([
			'deployment.md',
			'deployment.md#vercel',
			'deployment.md#troubleshooting',
			'styling.md'
		]);
		expect(records[1]).toMatchObject({
			pathname: '/docs/deployment#vercel',
			title: 'Deployment',
			section: 'Vercel',
			headingPath: ['Deployment', 'Vercel'],
			boost: 1,
			tags: ['ops']
		});
		expect(records[0]?.boost).toBe(2);
	});

	it('indexes prose rather than markup or code', () => {
		expect(records[1]?.body).toContain('Install the Vercel adapter');
		expect(records[1]?.body).not.toContain('adapter-vercel');
		expect(toSearchableText('# Title\n\nSee [docs](/docs) and `code`.\n')).toBe(
			'Title See docs and code.'
		);
	});

	it('includes drafts only when asked', () => {
		expect(
			createDocsSearchRecords(pages, { sources, includeHidden: true }).some(
				(record) => record.pageId === 'secret.md'
			)
		).toBe(true);
	});
});

describe.each(providers)('$name provider behaviour suite', ({ provider }) => {
	async function client() {
		if (!provider.createClient) {
			throw new Error('provider has no client');
		}
		return provider.createClient({ records });
	}

	it('finds a page by its title', async () => {
		const results = await (await client()).search('styling');

		expect(results.length).toBeGreaterThan(0);
		expect(results[0]?.record.pageId).toBe('styling.md');
	});

	it('finds a section and links to its anchor', async () => {
		const results = await (await client()).search('vercel adapter');
		const section = results.find((result) => result.record.section === 'Vercel');

		expect(section).toBeDefined();
		expect(section?.record.pathname).toBe('/docs/deployment#vercel');
	});

	it('returns an excerpt with every result', async () => {
		const results = await (await client()).search('deploy');

		expect(results.length).toBeGreaterThan(0);
		expect(results.every((result) => typeof result.excerpt === 'string')).toBe(true);
	});

	it('respects the result limit', async () => {
		expect(await (await client()).search('deploy', { limit: 1 })).toHaveLength(1);
	});

	it('returns nothing for an empty or stop-word query', async () => {
		const searchClient = await client();

		expect(await searchClient.search('')).toEqual([]);
		expect(await searchClient.search('the and of')).toEqual([]);
	});

	it('never returns drafts, which are not indexed', async () => {
		const results = await (await client()).search('internal deployment notes');

		expect(results.every((result) => result.record.pageId !== 'secret.md')).toBe(true);
	});

	it('filters by dimension', async () => {
		const results = await (await client()).search('styling', { filter: { locale: 'de' } });

		expect(results).toEqual([]);
	});

	it('sorts by descending score', async () => {
		const scores = (await (await client()).search('deploy')).map((result) => result.score);

		expect([...scores].sort((left, right) => right - left)).toEqual(scores);
	});
});

describe('generate', () => {
	it('writes a fetchable index for the client-side providers', async () => {
		const outDir = await mkdtemp(join(tmpdir(), 'docs-kit-search-'));
		temporaryRoots.push(outDir);

		await flexSearchProvider().generate?.(records, { outDir });
		await oramaProvider().generate?.(records, { outDir });

		expect(JSON.parse(await readFile(join(outDir, 'search/flexsearch.json'), 'utf8'))).toHaveLength(
			records.length
		);
		expect(JSON.parse(await readFile(join(outDir, 'search/orama.json'), 'utf8'))).toHaveLength(
			records.length
		);
	});

	it('runs the Pagefind indexer over the built site', async () => {
		let indexed: string | undefined;
		await pagefindProvider({ runIndexer: async (context) => void (indexed = context.buildDir) }).generate?.(
			records,
			{ outDir: '.docs-kit', buildDir: 'build' }
		);

		expect(indexed).toBe('build');
		await expect(
			pagefindProvider({ records }).generate?.(records, { outDir: '.docs-kit' })
		).rejects.toThrow(/buildDir/);
	});
});

describe('createDocsSearch', () => {
	it('creates a client by provider name and accepts a custom provider', async () => {
		expect((await createDocsSearch({ records })).name).toBe('flexsearch');
		expect((await createDocsSearch({ provider: 'orama', records })).name).toBe('orama');
		expect(
			(await createDocsSearch({ provider: { name: 'custom', createClient: () => ({ name: 'custom', search: async () => [] }) } })).name
		).toBe('custom');
	});

	it('fails clearly when a provider cannot make a client or records are missing', async () => {
		await expect(
			createDocsSearch({ provider: { name: 'build-only' } })
		).rejects.toThrow(/does not provide a client/);
		await expect(createDocsSearch({ provider: 'flexsearch' })).rejects.toThrow(/records/);
	});
});

describe('browser-safe search client', () => {
	it('queries in-memory records without loading build-only providers', async () => {
		const client = await createFlexSearchClient({ records });
		const results = await client.search('deployment');
		expect(results[0]?.record.id).toBe('deployment.md');
	});
});

describe('shared helpers', () => {
	it('filters by version, locale, and tags', () => {
		const record = records[0] as DocsSearchRecord;

		expect(matchesSearchFilter(record, { tags: ['ops'] })).toBe(true);
		expect(matchesSearchFilter(record, { tags: ['ops', 'other'] })).toBe(false);
		expect(matchesSearchFilter(record, undefined)).toBe(true);
	});

	it('centres excerpts on the match', () => {
		const record = records[2] as DocsSearchRecord;

		expect(createExcerpt(record, ['cache'], 40)).toContain('cache');
	});
});

describe('directive handling', () => {
	it('indexes directive content without the directive markers', () => {
		expect(
			toSearchableText(':::steps\n\n## Install\n\nRun the installer.\n\n:::\n')
		).toBe('Install Run the installer.');
		expect(
			toSearchableText(':::tabs\n\n@tab pnpm\n\nUse pnpm.\n\n:::\n')
		).toBe('pnpm Use pnpm.');
		expect(toSearchableText(':::warning{title="Careful"}\nBack up.\n:::')).toBe('Back up.');
	});
});

describe('highlightMatches', () => {
	it('splits text into matched and unmatched segments', () => {
		expect(highlightMatches('Deploy with the Vercel adapter', 'vercel')).toEqual([
			{ text: 'Deploy with the ', match: false },
			{ text: 'Vercel', match: true },
			{ text: ' adapter', match: false }
		]);
	});

	it('merges overlapping matches and handles no match', () => {
		expect(highlightMatches('deploying deploys', 'deploy deploys').filter((s) => s.match)).toHaveLength(
			2
		);
		expect(highlightMatches('nothing here', 'vercel')).toEqual([
			{ text: 'nothing here', match: false }
		]);
		expect(highlightMatches('', 'x')).toEqual([{ text: '', match: false }]);
	});

	it('never returns markup, so a query cannot inject HTML', () => {
		const segments = highlightMatches('safe <script> text', '<script>');

		expect(segments.map((segment) => segment.text).join('')).toBe('safe <script> text');
		expect(segments.every((segment) => typeof segment.text === 'string')).toBe(true);
	});
});

describe('groupSearchResults', () => {
	it('groups sections under their page, keeping relevance order', async () => {
		const client = await createDocsSearch({ records });
		const groups = groupSearchResults(await client.search('deploy'));

		expect(groups.length).toBeGreaterThan(0);
		expect(groups[0]?.pathname.includes('#')).toBe(false);
		expect(groups.every((group) => group.results.length > 0)).toBe(true);
		expect(new Set(groups.map((group) => group.pageId)).size).toBe(groups.length);
	});
});

describe('createRecentSearches', () => {
	function memoryStorage(): Storage {
		const map = new Map<string, string>();
		return {
			get length() {
				return map.size;
			},
			clear: () => map.clear(),
			getItem: (key) => map.get(key) ?? null,
			key: (index) => [...map.keys()][index] ?? null,
			removeItem: (key) => void map.delete(key),
			setItem: (key, value) => void map.set(key, value)
		};
	}

	it('keeps the most recent queries without duplicates', () => {
		const history = createRecentSearches({ storage: memoryStorage(), limit: 3 });

		history.add('deploy');
		history.add('search');
		history.add('deploy');

		expect(history.list()).toEqual(['deploy', 'search']);

		history.add('a');
		history.add('b');
		expect(history.list()).toEqual(['b', 'a', 'deploy']);

		expect(history.remove('a')).toEqual(['b', 'deploy']);
		history.clear();
		expect(history.list()).toEqual([]);
	});

	it('ignores blank queries and survives unusable storage', () => {
		const history = createRecentSearches({ storage: memoryStorage() });
		expect(history.add('   ')).toEqual([]);

		const broken = createRecentSearches({
			storage: {
				...memoryStorage(),
				getItem: () => {
					throw new Error('denied');
				},
				setItem: () => {
					throw new Error('denied');
				}
			} as Storage
		});

		expect(broken.list()).toEqual([]);
		expect(() => broken.add('deploy')).not.toThrow();
	});
});

describe('large corpora', () => {
	/** 2,000 records is well beyond a typical documentation set. */
	const many = Array.from({ length: 1000 }, (_value, index) => [
		{
			id: `page-${index}.md`,
			pageId: `page-${index}.md`,
			pathname: `/docs/page-${index}`,
			title: `Page ${index}`,
			headingPath: [`Page ${index}`],
			body: `Deployment guidance number ${index}. ${'documentation content '.repeat(20)}`,
			boost: 2,
			tags: []
		},
		{
			id: `page-${index}.md#section`,
			pageId: `page-${index}.md`,
			pathname: `/docs/page-${index}#section`,
			title: `Page ${index}`,
			section: 'Vercel',
			headingPath: [`Page ${index}`, 'Vercel'],
			body: `Install the adapter for page ${index}. ${'more prose '.repeat(20)}`,
			boost: 1,
			tags: []
		}
	]).flat();

	it.each(['flexsearch', 'orama'] as const)(
		'%s indexes and searches 2,000 records quickly',
		async (provider) => {
			const startedIndexing = performance.now();
			const client = await createDocsSearch({ provider, records: many });
			const indexed = performance.now() - startedIndexing;

			const startedSearching = performance.now();
			const results = await client.search('vercel adapter', { limit: 10 });
			const searched = performance.now() - startedSearching;

			expect(results.length).toBeGreaterThan(0);
			expect(results).toHaveLength(10);
			// Generous ceilings: the point is to catch a regression into unusable territory.
			expect(indexed).toBeLessThan(5000);
			expect(searched).toBeLessThan(500);
		},
		30_000
	);
});
