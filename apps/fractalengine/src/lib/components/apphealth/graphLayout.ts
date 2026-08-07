/**
 * Pure layout + validation for the module-flow scan renderer.
 * No Svelte, no DOM — unit-testable in isolation.
 */

import type { EdgeKind, GroupId, ModuleFlowScan, ScanEdge, ScanNode } from './types';

export const GROUP_ORDER: GroupId[] = [
	'layout',
	'components',
	'shared',
	'state',
	'commands',
	'ipc',
	'external'
];

export const GROUP_COLORS: Record<GroupId, string> = {
	layout: '#a78bfa',
	components: '#60a5fa',
	shared: '#94a3b8',
	state: '#22d3ee',
	commands: '#34d399',
	ipc: '#fb7185',
	external: '#fbbf24'
};

export const EDGE_KINDS: EdgeKind[] = [
	'renders',
	'imports',
	'reads',
	'writes',
	'calls',
	'commands',
	'dispatches',
	'listens',
	'ipc',
	'navigates'
];

export const EDGE_COLORS: Record<EdgeKind, string> = {
	renders: '#8b5cf6',
	imports: '#64748b',
	reads: '#22d3ee',
	writes: '#f59e0b',
	calls: '#c084fc',
	commands: '#34d399',
	dispatches: '#fb7185',
	listens: '#f472b6',
	ipc: '#f43f5e',
	navigates: '#38bdf8'
};

export const CARD_W = 184;
export const CARD_H = 46;
const COL_GAP = 88;
const ROW_H = 64;
const HEADER_H = 68;
const PAD = 32;

export interface LayoutNode extends ScanNode {
	col: number;
	row: number;
	x: number;
	y: number;
	degree: number;
}

export interface LayoutEdge extends ScanEdge {
	d: string;
}

export interface LayoutColumn {
	id: GroupId;
	label: string;
	color: string;
	x: number;
}

export interface GraphLayout {
	columns: LayoutColumn[];
	nodes: LayoutNode[];
	nodesById: Map<string, LayoutNode>;
	edges: LayoutEdge[];
	adjacency: Map<string, Set<string>>;
	width: number;
	height: number;
}

function edgePath(a: LayoutNode, b: LayoutNode): string {
	const ay = a.y + CARD_H / 2;
	const by = b.y + CARD_H / 2;
	if (a.col === b.col) {
		const x = a.x;
		return `M ${x} ${ay} C ${x - 56} ${ay}, ${x - 56} ${by}, ${x} ${by}`;
	}
	let x1: number;
	let x2: number;
	if (b.col > a.col) {
		x1 = a.x + CARD_W;
		x2 = b.x;
	} else {
		x1 = a.x;
		x2 = b.x + CARD_W;
	}
	const k = Math.min(140, Math.max(36, Math.abs(x2 - x1) * 0.45));
	const s = x2 > x1 ? 1 : -1;
	return `M ${x1} ${ay} C ${x1 + s * k} ${ay}, ${x2 - s * k} ${by}, ${x2} ${by}`;
}

export function computeLayout(scan: ModuleFlowScan): GraphLayout {
	const nodesById = new Map(scan.nodes.map(n => [n.id, n]));
	const degree = new Map<string, number>();
	const adjacency = new Map<string, Set<string>>();
	for (const n of scan.nodes) adjacency.set(n.id, new Set());
	for (const e of scan.edges) {
		if (!nodesById.has(e.from) || !nodesById.has(e.to)) continue;
		degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
		degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
		adjacency.get(e.from)!.add(e.to);
		adjacency.get(e.to)!.add(e.from);
	}

	// Tree order from the entry layout, following `renders` edges (BFS).
	const entryId =
		scan.nodes.find(n => n.path === scan.module.entryLayout)?.id ??
		scan.nodes.find(n => n.group === 'layout')?.id ??
		scan.nodes[0]?.id;
	const childrenOf = new Map<string, string[]>();
	for (const e of scan.edges) {
		if (e.kind !== 'renders') continue;
		const arr = childrenOf.get(e.from) ?? [];
		arr.push(e.to);
		childrenOf.set(e.from, arr);
	}
	const treeOrder = new Map<string, number>();
	if (entryId) {
		let counter = 0;
		const queue = [entryId];
		while (queue.length) {
			const id = queue.shift()!;
			if (treeOrder.has(id)) continue;
			treeOrder.set(id, counter++);
			for (const c of childrenOf.get(id) ?? []) queue.push(c);
		}
	}

	// Groups present, in canonical order (unknown groups appended for robustness).
	const groupsPresent: GroupId[] = GROUP_ORDER.filter(g => scan.nodes.some(n => n.group === g));
	for (const n of scan.nodes) {
		if (!groupsPresent.includes(n.group)) groupsPresent.push(n.group);
	}
	const byGroup = new Map<GroupId, ScanNode[]>();
	for (const g of groupsPresent) byGroup.set(g, []);
	for (const n of scan.nodes) byGroup.get(n.group)?.push(n);

	// Initial per-group order: renders-tree order first, then degree, then label.
	const orderOf = new Map<string, number>();
	for (const [, arr] of byGroup) {
		const sorted = [...arr].sort((a, b) => {
			const ta = treeOrder.get(a.id);
			const tb = treeOrder.get(b.id);
			if (ta !== undefined || tb !== undefined) return (ta ?? 1e9) - (tb ?? 1e9);
			return (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0) || a.label.localeCompare(b.label);
		});
		sorted.forEach((n, i) => orderOf.set(n.id, i));
	}

	// Barycenter sweeps to reduce edge crossings (layout column stays tree-ordered).
	for (let pass = 0; pass < 3; pass++) {
		for (const g of groupsPresent) {
			if (g === 'layout') continue;
			const arr = byGroup.get(g)!;
			const scored = arr.map(n => {
				const neigh = adjacency.get(n.id);
				let b = Number.POSITIVE_INFINITY;
				if (neigh && neigh.size) {
					let sum = 0;
					let cnt = 0;
					for (const m of neigh) {
						const o = orderOf.get(m);
						if (o !== undefined) {
							sum += o;
							cnt++;
						}
					}
					if (cnt) b = sum / cnt;
				}
				return { n, b };
			});
			scored.sort((a, b) => a.b - b.b || orderOf.get(a.n.id)! - orderOf.get(b.n.id)!);
			scored.forEach((s, i) => orderOf.set(s.n.id, i));
		}
	}

	const colIndex = new Map(groupsPresent.map((g, i) => [g, i]));
	const groupLabels = new Map(scan.groups.map(g => [g.id, g.label]));
	const columns: LayoutColumn[] = groupsPresent.map((g, i) => ({
		id: g,
		label: groupLabels.get(g) ?? g,
		color: GROUP_COLORS[g] ?? '#94a3b8',
		x: PAD + i * (CARD_W + COL_GAP)
	}));

	let maxRows = 0;
	const nodes: LayoutNode[] = [];
	for (const [g, arr] of byGroup) {
		const col = colIndex.get(g)!;
		maxRows = Math.max(maxRows, arr.length);
		const sorted = [...arr].sort((a, b) => orderOf.get(a.id)! - orderOf.get(b.id)!);
		sorted.forEach((n, row) =>
			nodes.push({
				...n,
				col,
				row,
				x: PAD + col * (CARD_W + COL_GAP),
				y: PAD + HEADER_H + row * ROW_H,
				degree: degree.get(n.id) ?? 0
			})
		);
	}
	const lnById = new Map(nodes.map(n => [n.id, n]));
	const width = PAD * 2 + groupsPresent.length * CARD_W + (groupsPresent.length - 1) * COL_GAP;
	const height = PAD * 2 + HEADER_H + maxRows * ROW_H;

	const edges: LayoutEdge[] = [];
	for (const e of scan.edges) {
		const a = lnById.get(e.from);
		const b = lnById.get(e.to);
		if (!a || !b) continue;
		edges.push({ ...e, d: edgePath(a, b) });
	}
	return { columns, nodes, nodesById: lnById, edges, adjacency, width, height };
}

/** Contract checks — mirrors the validation step of the scanner prompt. */
export function validateScan(scan: ModuleFlowScan): string[] {
	const issues: string[] = [];
	const ids = new Set<string>();
	for (const n of scan.nodes) {
		if (ids.has(n.id)) issues.push(`duplicate node id: ${n.id}`);
		ids.add(n.id);
	}
	for (const e of scan.edges) {
		if (!ids.has(e.from)) issues.push(`edge from unknown node: ${e.from}`);
		if (!ids.has(e.to)) issues.push(`edge to unknown node: ${e.to}`);
		if (!EDGE_KINDS.includes(e.kind)) issues.push(`unknown edge kind: ${e.kind} (${e.from} -> ${e.to})`);
	}
	for (const f of scan.flows) {
		for (const s of f.steps) {
			if (!ids.has(s)) issues.push(`flow ${f.id} references unknown node: ${s}`);
		}
	}
	return issues;
}
