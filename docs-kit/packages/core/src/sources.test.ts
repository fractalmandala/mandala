import { describe, expect, it } from 'vitest';

import {
	createDocsSourceFailurePlan,
	createDocsSourceSyncPlan,
	mergeDocsSourceCacheIndex,
	parseDocsSourceCacheIndex
} from './cache.js';
import {
	normalizeDocsSourceDocument,
	resolveDocsSourceConflicts,
	toDiscoveredContent,
	type DocsSourceRecord
} from './sources.js';

const github = { id: 'github', type: 'github', priority: 10 };
const notion = { id: 'notion', type: 'notion', priority: 1 };

function record(
	source: { id: string; type: string; priority?: number; namespace?: string },
	relativePath: string,
	content: string
): DocsSourceRecord {
	return normalizeDocsSourceDocument(source, { relativePath, content });
}

describe('normalizeDocsSourceDocument', () => {
	it('derives manifest identity and provenance', () => {
		const normalized = normalizeDocsSourceDocument(github, {
			relativePath: './guides/deployment.md',
			content: '# Deployment',
			origin: { repository: 'acme/product', ref: 'main' }
		});

		expect(normalized).toMatchObject({
			sourceId: 'github',
			relativePath: 'guides/deployment.md',
			extension: '.md',
			slug: 'guides/deployment',
			slugSegments: ['guides', 'deployment'],
			pathname: '/guides/deployment',
			origin: { type: 'github', repository: 'acme/product', ref: 'main' },
			priority: 10,
			namespace: 'github'
		});
		expect(normalized.contentHash).toMatch(/^fnv1a-[0-9a-f]{8}$/);
	});

	it('rejects unsafe or unsupported document paths', () => {
		expect(() => record(github, '../secrets.md', '')).toThrow(/traversing/);
		expect(() => record(github, '/etc/passwd.md', '')).toThrow(/absolute/);
		expect(() => record(github, 'notes.txt', '')).toThrow(/unsupported/);
		expect(() => record(github, '', '')).toThrow(/without a path/);
	});
});

describe('resolveDocsSourceConflicts', () => {
	const conflicting = [
		record(github, 'install.md', 'from github'),
		record(notion, 'install.md', 'from notion'),
		record(notion, 'about.md', 'only notion')
	];

	it('fails by default and explains both sources', () => {
		const { records, diagnostics } = resolveDocsSourceConflicts(conflicting);

		expect(records.map((entry) => entry.relativePath)).toEqual(['about.md']);
		expect(diagnostics).toEqual([
			{
				code: 'DUPLICATE_SOURCE_SLUG',
				severity: 'error',
				slug: 'install',
				sources: ['github', 'notion'],
				message:
					'"install" is provided by github and notion. Set a conflict policy, a source priority, or a namespace.'
			}
		]);
	});

	it('keeps the highest priority document under the priority policy', () => {
		const { records, diagnostics } = resolveDocsSourceConflicts(conflicting, {
			onConflict: 'priority'
		});

		expect(records.map((entry) => `${entry.relativePath}:${entry.sourceId}`)).toEqual([
			'about.md:notion',
			'install.md:github'
		]);
		expect(diagnostics[0]).toMatchObject({ code: 'SOURCE_SLUG_DROPPED', severity: 'warning' });
	});

	it('namespaces every colliding document under the namespace policy', () => {
		const { records, diagnostics } = resolveDocsSourceConflicts(conflicting, {
			onConflict: 'namespace'
		});

		expect(records.map((entry) => entry.slug)).toEqual([
			'about',
			'github/install',
			'notion/install'
		]);
		expect(diagnostics[0]).toMatchObject({ code: 'SOURCE_SLUG_NAMESPACED', severity: 'warning' });
	});

	it('treats the same slug in different dimensions as distinct pages', () => {
		const english = normalizeDocsSourceDocument(github, {
			relativePath: 'install.md',
			content: 'english',
			locale: 'en'
		});
		const german = normalizeDocsSourceDocument(notion, {
			relativePath: 'install.md',
			content: 'german',
			locale: 'de'
		});

		expect(resolveDocsSourceConflicts([english, german]).diagnostics).toEqual([]);
	});
});

describe('toDiscoveredContent', () => {
	it('projects records onto the discovery shape used by the manifest', () => {
		const records = resolveDocsSourceConflicts([record(github, 'guides/index.md', 'body')]).records;

		expect(toDiscoveredContent(records, (entry) => `/cache/${entry.sourceId}/${entry.relativePath}`)).toEqual([
			{
				sourcePath: '/cache/github/guides/index.md',
				relativePath: 'guides/index.md',
				extension: '.md',
				slugSegments: ['guides'],
				slug: 'guides',
				pathname: '/guides',
				contentHash: records[0]?.contentHash
			}
		]);
	});
});

describe('source cache planning', () => {
	const first = [record(github, 'a.md', 'one'), record(github, 'b.md', 'two')];

	it('writes every document on the first sync', () => {
		const plan = createDocsSourceSyncPlan('github', first, undefined, '2026-08-06T00:00:00.000Z');

		expect(plan.writes.map((write) => write.relativePath)).toEqual(['a.md', 'b.md']);
		expect(plan.deletes).toEqual([]);
		expect(plan.state).toMatchObject({ status: 'fetched', fetchedAt: '2026-08-06T00:00:00.000Z' });
	});

	it('rewrites only changed documents and prunes removed ones', () => {
		const previous = createDocsSourceSyncPlan('github', first, undefined, 'first').state;
		const next = [record(github, 'a.md', 'one'), record(github, 'c.md', 'three')];
		const plan = createDocsSourceSyncPlan('github', next, previous, 'second');

		expect(plan.unchanged).toEqual(['a.md']);
		expect(plan.writes.map((write) => write.relativePath)).toEqual(['c.md']);
		expect(plan.deletes).toEqual(['b.md']);
	});

	it('keeps cached content and records the error when a source fails', () => {
		const previous = createDocsSourceSyncPlan('github', first, undefined, 'first').state;
		const plan = createDocsSourceFailurePlan('github', previous, 'HTTP 503');

		expect(plan).toMatchObject({ status: 'cached', error: 'HTTP 503', writes: [], deletes: [] });
		expect(plan.state.entries).toHaveLength(2);
		expect(plan.state.fetchedAt).toBe('first');
	});

	it('reports a hard failure when nothing was ever cached', () => {
		expect(createDocsSourceFailurePlan('github', undefined, 'ENOTFOUND').status).toBe('failed');
	});

	it('round-trips a deterministic index and discards corrupt formats', () => {
		const index = mergeDocsSourceCacheIndex([
			createDocsSourceFailurePlan('notion', undefined, 'boom').state,
			createDocsSourceSyncPlan('github', first, undefined, 'first').state
		]);

		expect(index.sources.map((source) => source.sourceId)).toEqual(['github', 'notion']);
		expect(parseDocsSourceCacheIndex(JSON.parse(JSON.stringify(index)))).toEqual(index);
		expect(parseDocsSourceCacheIndex({ version: 99, sources: [] }).sources).toEqual([]);
		expect(parseDocsSourceCacheIndex('nope').version).toBe(1);
	});
});
