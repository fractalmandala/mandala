<script lang="ts">
	import type { GraphReport } from '$lib/ipc';

	let { graph, activePath, onOpen }: { graph: GraphReport; activePath?: string; onOpen: (path: string) => void } = $props();
	const width = 360;
	const height = 244;
	let nodes = $derived(visibleNodes());

	function visibleNodes() {
		const ranked = [...graph.nodes].sort((left, right) => {
			if (left.path === activePath) return -1;
			if (right.path === activePath) return 1;
			return right.incoming + right.outgoing - left.incoming - left.outgoing || left.path.localeCompare(right.path);
		});
		return ranked.slice(0, 22);
	}

	function point(index: number, count: number, path: string) {
		if (path === activePath) return { x: width / 2, y: height / 2 };
		const activeOffset = activePath && nodes.some((node) => node.path === activePath) ? 1 : 0;
		const adjusted = Math.max(0, index - activeOffset);
		const ringCount = Math.max(1, count - activeOffset);
		const angle = -Math.PI / 2 + (adjusted / ringCount) * Math.PI * 2;
		const radius = 77 + (adjusted % 3) * 22;
		return { x: width / 2 + Math.cos(angle) * radius, y: height / 2 + Math.sin(angle) * radius };
	}

	function position(path: string) {
		const index = nodes.findIndex((node) => node.path === path);
		return index < 0 ? null : point(index, nodes.length, path);
	}

	function label(path: string) { return path.split('/').at(-1)?.replace(/\.mdx?$/i, '') || path; }
</script>

<div class="knowledge-graph">
	<svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${nodes.length} visible documents and ${graph.edges.length} links`}>
		<defs><filter id="graph-soften"><feGaussianBlur stdDeviation=".2" /></filter></defs>
		{#each graph.edges as [from, to]}
			{@const source = position(from)}{@const target = position(to)}
			{#if source && target}<line x1={source.x} y1={source.y} x2={target.x} y2={target.y} filter="url(#graph-soften)" />{/if}
		{/each}
		{#each nodes as node, index (node.path)}
			{@const dot = point(index, nodes.length, node.path)}
			<a href={`#${encodeURIComponent(node.path)}`} onclick={(event) => { event.preventDefault(); onOpen(node.path); }} aria-label={`Open ${node.path}`}>
				<title>{node.path} · {node.incoming} inbound, {node.outgoing} outbound</title>
				<circle cx={dot.x} cy={dot.y} r={node.path === activePath ? 10 : Math.min(8, 4 + node.incoming)} class:knowledge-graph__active={node.path === activePath} class:knowledge-graph__orphan={node.orphan} />
				<text x={dot.x} y={dot.y + 17} text-anchor="middle">{label(node.path).slice(0, 14)}</text>
			</a>
		{/each}
	</svg>
	<p>{nodes.length < graph.nodes.length ? `Showing the ${nodes.length} most connected of ${graph.nodes.length} documents.` : `${graph.nodes.length} documents.`}</p>
</div>
