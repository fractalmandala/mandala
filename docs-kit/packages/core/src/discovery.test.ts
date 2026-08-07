import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { discoverLocalContent, findDiscoveredContent } from './discovery.js';

const temporaryRoots: string[] = [];

async function createFixture(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'docs-kit-core-'));
	temporaryRoots.push(root);
	return root;
}

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { force: true, recursive: true })));
});

describe('discoverLocalContent', () => {
	it('recursively finds supported files in deterministic order and resolves index paths', async () => {
		const root = await createFixture();
		await mkdir(join(root, 'guide', 'nested'), { recursive: true });
		await writeFile(join(root, 'z-last.md'), '# Last');
		await writeFile(join(root, 'guide', 'index.svx'), '# Guide');
		await writeFile(join(root, 'guide', 'nested', 'page.md'), '# Page');
		await writeFile(join(root, 'ignored.txt'), 'ignored');

		const content = await discoverLocalContent({ root });

		expect(content.map((entry) => entry.relativePath)).toEqual([
			'guide/index.svx',
			'guide/nested/page.md',
			'z-last.md'
		]);
		expect(content.map((entry) => entry.slug)).toEqual(['guide', 'guide/nested/page', 'z-last']);
		expect(content[0]).toMatchObject({
			extension: '.svx',
			slugSegments: ['guide'],
			pathname: '/guide'
		});
		expect(content[0]?.sourcePath).toContain('/guide/index.svx');
	});

	it('excludes hidden directories by default and can include them explicitly', async () => {
		const root = await createFixture();
		await mkdir(join(root, '.drafts'), { recursive: true });
		await writeFile(join(root, '.drafts', 'secret.md'), '# Secret');
		await writeFile(join(root, 'visible.md'), '# Visible');

		expect((await discoverLocalContent({ root })).map((entry) => entry.slug)).toEqual(['visible']);
		expect(
			(await discoverLocalContent({ root, includeHiddenDirectories: true })).map((entry) => entry.slug)
		).toEqual(['.drafts/secret', 'visible']);
	});

	it('finds content with a normalized requested slug', async () => {
		const root = await createFixture();
		await mkdir(join(root, 'guide'), { recursive: true });
		await writeFile(join(root, 'guide', 'index.md'), '# Guide');

		const content = await discoverLocalContent({ root });
		expect(findDiscoveredContent(content, 'guide/index.md')).toMatchObject({ slug: 'guide' });
	});
});
