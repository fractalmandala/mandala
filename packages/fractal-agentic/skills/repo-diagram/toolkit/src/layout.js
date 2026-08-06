import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

/** Layout options per diagram type. This is the "one grammar per diagram" knob. */
export const PRESETS = {
	// Containment is the message: pack boxes, edges are secondary.
	// Containment is the message. Each container packs its own children densely
	// (SEPARATE_CHILDREN), so boxes stay tight and readable no matter how deep you drill.
	// Edges are drawn over the result rather than driving it.
	layout: {
		'elk.algorithm': 'layered',
		'elk.direction': 'RIGHT',
		'elk.hierarchyHandling': 'SEPARATE_CHILDREN',
		'elk.layered.spacing.nodeNodeBetweenLayers': '80',
		'elk.spacing.nodeNode': '34',
		'elk.spacing.componentComponent': '48',
		'elk.padding': '[top=20,left=20,bottom=20,right=20]'
	},
	// Swim lanes: groups stack vertically, nodes run left-to-right inside each.
	lanes: {
		'elk.algorithm': 'layered',
		'elk.direction': 'DOWN',
		'elk.hierarchyHandling': 'SEPARATE_CHILDREN',
		'elk.layered.spacing.nodeNodeBetweenLayers': '40',
		'elk.spacing.nodeNode': '30',
		'elk.padding': '[top=20,left=20,bottom=20,right=20]'
	}
};

/** How each container lays out its own children, per preset. */
const CONTAINER_OPTS = {
	layout: {
		'elk.algorithm': 'rectpacking',
		'elk.aspectRatio': '1.7',
		'elk.spacing.nodeNode': '14',
		'elk.padding': '[top=42,left=14,bottom=14,right=14]'
	},
	lanes: {
		'elk.algorithm': 'layered',
		'elk.direction': 'RIGHT',
		'elk.layered.spacing.nodeNodeBetweenLayers': '54',
		'elk.spacing.nodeNode': '16',
		'elk.padding': '[top=40,left=16,bottom=16,right=16]'
	}
};

const LEAF_W = 190;
const LEAF_H = 52;

/** Collapsed containers carry a rolled-up summary line, so they need more room. */
function leafSize(n, isCollapsedContainer) {
	const chars = (n.label ?? '').length;
	const w = Math.max(LEAF_W, Math.min(340, 46 + chars * 8.2 + (isCollapsedContainer ? 60 : 24)));
	return { width: Math.round(w), height: isCollapsedContainer ? 62 : LEAF_H };
}

/**
 * Build the ELK tree from our graph contract, honouring collapsed containers.
 * Returns { positions: Map<id,{x,y,width,height}>, visible: Set<id> }
 */
export async function layoutGraph(graph, { collapsed = new Set(), preset = 'layout' } = {}) {
	const byId = new Map(graph.nodes.map((n) => [n.id, n]));
	const childrenOf = new Map();
	for (const n of graph.nodes) {
		const k = n.parentId ?? '__root__';
		if (!childrenOf.has(k)) childrenOf.set(k, []);
		childrenOf.get(k).push(n);
	}

	// A node is visible if no ancestor is collapsed.
	const visible = new Set();
	const walkVisible = (id) => {
		visible.add(id);
		if (collapsed.has(id)) return;
		for (const c of childrenOf.get(id) ?? []) walkVisible(c.id);
	};
	for (const r of childrenOf.get('__root__') ?? []) walkVisible(r.id);

	const toElk = (n) => {
		const kids = collapsed.has(n.id) ? [] : (childrenOf.get(n.id) ?? []);
		if (kids.length === 0) {
			const hasHidden = (childrenOf.get(n.id) ?? []).length > 0;
			return { id: n.id, ...leafSize(n, hasHidden) };
		}
		return {
			id: n.id,
			children: kids.map(toElk),
			layoutOptions: CONTAINER_OPTS[preset] ?? CONTAINER_OPTS.layout
		};
	};

	// Lift edges to the deepest visible endpoint, then dedupe.
	const liftTo = (id) => {
		let cur = id;
		while (cur && !visible.has(cur)) cur = byId.get(cur)?.parentId ?? null;
		return cur;
	};
	const lifted = new Map();
	for (const e of graph.edges) {
		const s = liftTo(e.source);
		const t = liftTo(e.target);
		if (!s || !t || s === t) continue;
		const key = `${s}→${t}→${e.layer}`;
		const cur = lifted.get(key) ?? { id: key, source: s, target: t, layer: e.layer, weight: 0 };
		cur.weight += e.weight ?? 1;
		lifted.set(key, cur);
	}

	const elkGraph = {
		id: 'root',
		layoutOptions: PRESETS[preset] ?? PRESETS.layout,
		children: (childrenOf.get('__root__') ?? []).map(toElk),
		edges: [...lifted.values()].map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] }))
	};

	const res = await elk.layout(elkGraph);

	const positions = new Map();
	const collect = (node, ox = 0, oy = 0) => {
		for (const c of node.children ?? []) {
			// Svelte Flow child positions are relative to the parent, which is what ELK gives us.
			positions.set(c.id, { x: c.x ?? 0, y: c.y ?? 0, width: c.width ?? LEAF_W, height: c.height ?? LEAF_H });
			collect(c, (ox + (c.x ?? 0)), (oy + (c.y ?? 0)));
		}
	};
	collect(res);

	return { positions, visible, edges: [...lifted.values()], childrenOf };
}