import { describe, expect, it } from 'vitest';
import { computeLayout, validateScan, type EdgeKind } from '$lib/components/apphealth';
import { sampleScan } from '$lib/components/apphealth/sampleScan';
import type { ModuleFlowScan } from '$lib/components/apphealth/types';

describe('apphealth module-flow scan', () => {
	it('validates the bundled sample scan as contract-clean', () => {
		expect(validateScan(sampleScan)).toEqual([]);
	});

	it('positions every node on a column and gives every edge a path', () => {
		const layout = computeLayout(sampleScan);
		expect(layout.nodes.length).toBe(sampleScan.nodes.length);
		for (const n of layout.nodes) {
			expect(Number.isFinite(n.x)).toBe(true);
			expect(Number.isFinite(n.y)).toBe(true);
			expect(n.row).toBeGreaterThanOrEqual(0);
		}
		expect(layout.edges.length).toBe(sampleScan.edges.length);
		for (const e of layout.edges) expect(e.d.startsWith('M ')).toBe(true);
	});

	it('keeps columns in canonical group order', () => {
		const layout = computeLayout(sampleScan);
		expect(layout.columns.map(c => c.id)).toEqual([
			'layout',
			'components',
			'shared',
			'state',
			'commands',
			'ipc',
			'external'
		]);
	});

	it('builds symmetric adjacency for hover highlighting', () => {
		const layout = computeLayout(sampleScan);
		for (const e of sampleScan.edges) {
			expect(layout.adjacency.get(e.from)?.has(e.to)).toBe(true);
			expect(layout.adjacency.get(e.to)?.has(e.from)).toBe(true);
		}
	});

	it('flags dangling edges, bad kinds, and dangling flow steps', () => {
		const broken = JSON.parse(JSON.stringify(sampleScan)) as ModuleFlowScan;
		broken.edges.push({ from: 'cmp:NoteList', to: 'ghost:Missing', kind: 'reads' });
		broken.edges.push({
			from: 'cmp:NoteList',
			to: 'state:notesState',
			kind: 'teleports' as unknown as EdgeKind
		});
		broken.flows[0].steps.push('ghost:Missing');
		const issues = validateScan(broken);
		expect(issues.some(i => i.includes('ghost:Missing'))).toBe(true);
		expect(issues.some(i => i.includes('teleports'))).toBe(true);
	});
});
