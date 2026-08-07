import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { builtinRegistry } from './builtin.js';
import { applyInstallPlan, createInstallPlan } from './install.js';
import { parseRegistry, registryVersion, type Registry } from './types.js';
import { satisfiesFrameworkVersion } from './version.js';

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const registry: Registry = {
	version: registryVersion,
	items: [
		{
			name: 'base',
			type: 'component',
			title: 'Base',
			description: 'Base styles.',
			frameworkVersion: '*',
			files: [{ path: 'base.css', content: ':root { --docs-accent: #00d148; }' }]
		},
		{
			name: 'card',
			type: 'component',
			title: 'Card',
			description: 'Card component.',
			frameworkVersion: '^1.2.0',
			registryDependencies: ['base'],
			dependencies: ['@docs-kit/components'],
			files: [
				{ path: 'components/Card.svelte', content: '<div class="card"></div>' },
				{ path: 'card/+server.ts', content: 'export const GET = () => new Response();', target: 'route' }
			],
			docs: 'Import Card where you need it.'
		},
		{
			name: 'future',
			type: 'component',
			title: 'Future',
			description: 'Requires a newer framework.',
			frameworkVersion: '>=2.0.0',
			files: [{ path: 'future.ts', content: 'export const future = true;' }]
		}
	]
};

describe('satisfiesFrameworkVersion', () => {
	it('evaluates the supported range subset', () => {
		expect(satisfiesFrameworkVersion('1.2.3', '*')).toBe(true);
		expect(satisfiesFrameworkVersion('1.2.3', '^1.2.0')).toBe(true);
		expect(satisfiesFrameworkVersion('2.0.0', '^1.2.0')).toBe(false);
		expect(satisfiesFrameworkVersion('0.3.1', '^0.3.0')).toBe(true);
		expect(satisfiesFrameworkVersion('0.4.0', '^0.3.0')).toBe(false);
		expect(satisfiesFrameworkVersion('1.2.9', '~1.2.0')).toBe(true);
		expect(satisfiesFrameworkVersion('1.3.0', '~1.2.0')).toBe(false);
		expect(satisfiesFrameworkVersion('1.5.0', '>=1.2.0 <2.0.0')).toBe(true);
		expect(satisfiesFrameworkVersion('2.0.0', '>=1.2.0 <2.0.0')).toBe(false);
		expect(satisfiesFrameworkVersion('not-a-version', '*')).toBe(false);
	});
});

describe('parseRegistry', () => {
	it('rejects unknown versions and malformed items', () => {
		expect(parseRegistry(JSON.parse(JSON.stringify(registry))).items).toHaveLength(3);
		expect(() => parseRegistry({ version: 99, items: [] })).toThrow(/Unsupported registry version/);
		expect(() => parseRegistry({ version: registryVersion, items: [{ name: 'a', files: [] }] })).toThrow(
			/has no files/
		);
		expect(() =>
			parseRegistry({
				version: registryVersion,
				items: [{ name: 'a', files: [{ path: 'a', content: '' }] }]
			})
		).toThrow(/frameworkVersion/);
	});
});

describe('createInstallPlan', () => {
	it('resolves dependencies deterministically and routes files by target', () => {
		const plan = createInstallPlan({ registry, names: ['card'], frameworkVersion: '1.2.3' });

		expect(plan.items.map((item) => item.name)).toEqual(['base', 'card']);
		expect(plan.files.map((file) => file.path)).toEqual([
			'src/lib/docs-kit/base.css',
			'src/lib/docs-kit/components/Card.svelte',
			'src/routes/card/+server.ts'
		]);
		expect(plan.dependencies).toEqual(['@docs-kit/components']);
		expect(plan.docs).toEqual([{ item: 'card', docs: 'Import Card where you need it.' }]);
	});

	it('honours custom install roots', () => {
		const plan = createInstallPlan({
			registry,
			names: ['card'],
			frameworkVersion: '1.2.3',
			libDir: 'src/lib/vendor',
			routesDir: 'src/app'
		});

		expect(plan.files.map((file) => file.path)).toContain('src/lib/vendor/components/Card.svelte');
		expect(plan.files.map((file) => file.path)).toContain('src/app/card/+server.ts');
	});

	it('refuses incompatible, unknown, and cyclic items', () => {
		expect(() => createInstallPlan({ registry, names: ['future'], frameworkVersion: '1.2.3' })).toThrow(
			/requires docs-kit >=2.0.0/
		);
		expect(() => createInstallPlan({ registry, names: ['nope'], frameworkVersion: '1.2.3' })).toThrow(
			/Unknown registry item "nope"/
		);

		const cyclic: Registry = {
			version: registryVersion,
			items: [
				{
					name: 'a',
					type: 'component',
					title: 'A',
					description: '',
					frameworkVersion: '*',
					registryDependencies: ['b'],
					files: [{ path: 'a.ts', content: '' }]
				},
				{
					name: 'b',
					type: 'component',
					title: 'B',
					description: '',
					frameworkVersion: '*',
					registryDependencies: ['a'],
					files: [{ path: 'b.ts', content: '' }]
				}
			]
		};
		expect(() => createInstallPlan({ registry: cyclic, names: ['a'], frameworkVersion: '1.0.0' })).toThrow(
			/dependency cycle/
		);
	});

	it('produces the same plan for the same request', () => {
		const first = createInstallPlan({ registry, names: ['card', 'base'], frameworkVersion: '1.2.3' });
		const second = createInstallPlan({ registry, names: ['base', 'card'], frameworkVersion: '1.2.3' });

		expect(second.files).toEqual(first.files);
	});
});

describe('applyInstallPlan', () => {
	it('copies files into the host project', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-registry-'));
		temporaryRoots.push(root);
		const plan = createInstallPlan({ registry, names: ['card'], frameworkVersion: '1.2.3' });
		const summary = await applyInstallPlan(plan, { cwd: root });

		expect(summary.written).toHaveLength(3);
		expect(await readFile(join(root, 'src/lib/docs-kit/components/Card.svelte'), 'utf8')).toBe(
			'<div class="card"></div>'
		);
	});

	it('skips customized files unless forced and never rewrites identical ones', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-registry-'));
		temporaryRoots.push(root);
		const plan = createInstallPlan({ registry, names: ['base'], frameworkVersion: '1.2.3' });

		await applyInstallPlan(plan, { cwd: root });
		expect((await applyInstallPlan(plan, { cwd: root })).unchanged).toEqual([
			'src/lib/docs-kit/base.css'
		]);

		await mkdir(join(root, 'src/lib/docs-kit'), { recursive: true });
		await writeFile(join(root, 'src/lib/docs-kit/base.css'), '/* mine */', 'utf8');
		expect((await applyInstallPlan(plan, { cwd: root })).skipped).toEqual([
			'src/lib/docs-kit/base.css'
		]);
		expect((await applyInstallPlan(plan, { cwd: root, force: true })).written).toEqual([
			'src/lib/docs-kit/base.css'
		]);
	});
});

describe('builtinRegistry', () => {
	it('ships installable items across every extension category', () => {
		expect(parseRegistry(builtinRegistry).items.length).toBeGreaterThan(0);
		expect([...new Set(builtinRegistry.items.map((item) => item.type))].sort()).toEqual([
			'analytics',
			'component',
			'feedback',
			'provider',
			'source'
		]);

		const plan = createInstallPlan({
			registry: builtinRegistry,
			names: builtinRegistry.items.map((item) => item.name),
			frameworkVersion: '0.0.0'
		});
		expect(plan.files.some((file) => file.path.endsWith('components/Callout.svelte'))).toBe(true);
		expect(plan.files.some((file) => file.path.startsWith('src/routes/'))).toBe(true);
	});
});
