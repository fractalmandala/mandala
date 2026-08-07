<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';

	// The input JSON data loaded as static constant
	const DATA = {
		"version": 1,
		"project": {
			"name": "fractalsvelte",
			"slug": "fractalsvelte",
			"tagline": "Token-driven Svelte 5 components, blocks, and motion, plus their docs site",
			"date": "2026-07-29"
		},
		"stats": { "agents": 0, "models": 0, "tools": 5, "integrations": 2 },
		"topModels": [],
		"topTools": [
			{ "id": "vite", "label": "Vite", "domain": "vitejs.dev" },
			{ "id": "svelte", "label": "Svelte 5", "domain": "svelte.dev" },
			{ "id": "mdsvex", "label": "MDsveX", "domain": "mdsvex.pngwn.io" },
			{ "id": "shiki", "label": "Shiki", "domain": "shiki.style" },
			{ "id": "playwright", "label": "Playwright", "domain": "playwright.dev" }
		],
		"topIntegrations": [
			{ "id": "vercel", "label": "Vercel", "domain": "vercel.com" },
			{ "id": "fractals-styler", "label": "fractals-styler", "domain": "npmjs.com" }
		],
		"graph": {
			"nodes": [
				{ "id": "root_layout", "label": "Root Layout", "kind": "entry", "sub": "/+layout.svelte", "sourceRef": "src/routes/+layout.svelte", "detail": "Loads package + site SASS, mounts Appshell/Seo/Toast, and (dev-only) an AI-agent devtool overlay" },
				{ "id": "home_page", "label": "Home Page", "kind": "entry", "sub": "/+page.svelte", "sourceRef": "src/routes/+page.svelte" },
				{ "id": "components_index", "label": "Components Index", "kind": "entry", "sub": "/components", "sourceRef": "src/routes/components/+page.svelte" },
				{ "id": "components_detail", "label": "Component Detail", "kind": "entry", "sub": "/components/[slug]", "sourceRef": "src/routes/components/[slug]/+page.server.ts", "detail": "entries() enumerates every slug from componentNavigation at build time" },
				{ "id": "components_md_export", "label": "Component Markdown API", "kind": "entry", "sub": "/components/[slug].md", "sourceRef": "src/routes/components/[slug].md/+server.ts", "detail": "Serves the same doc as raw Markdown for humans/agents that prefer plain text" },
				{ "id": "blocks_index", "label": "Blocks Index", "kind": "entry", "sub": "/blocks", "sourceRef": "src/routes/blocks/+page.svelte" },
				{ "id": "blocks_detail", "label": "Block Detail", "kind": "entry", "sub": "/blocks/[slug]", "sourceRef": "src/routes/blocks/[slug]/+page.server.ts" },
				{ "id": "blocks_md_export", "label": "Block Markdown API", "kind": "entry", "sub": "/blocks/[slug].md", "sourceRef": "src/routes/blocks/[slug].md/+server.ts" },
				{ "id": "motion_index", "label": "Motion Index", "kind": "entry", "sub": "/motion", "sourceRef": "src/routes/motion/+page.svelte" },
				{ "id": "motion_detail", "label": "Motion Detail", "kind": "entry", "sub": "/motion/[slug]", "sourceRef": "src/routes/motion/[slug]/+page.server.ts" },
				{ "id": "motion_md_export", "label": "Motion Markdown API", "kind": "entry", "sub": "/motion/[slug].md", "sourceRef": "src/routes/motion/[slug].md/+server.ts" },
				{ "id": "docs_index", "label": "Docs Index", "kind": "entry", "sub": "/docs", "sourceRef": "src/routes/docs/+page.svelte" },
				{ "id": "docs_detail", "label": "Doc Post", "kind": "entry", "sub": "/docs/[post]", "sourceRef": "src/routes/docs/[post]/+page.svelte" },
				{ "id": "sitemap_route", "label": "Sitemap", "kind": "entry", "sub": "/sitemap.xml", "sourceRef": "src/routes/sitemap.xml/+server.ts" },
				{ "id": "og_image_route", "label": "OG Image API", "kind": "entry", "sub": "/og/[section]/[slug].png", "sourceRef": "src/routes/og/[section]/[slug].png/+server.ts" },
				{ "id": "navigation_service", "label": "Content Navigation", "kind": "service", "sourceRef": "src/siteshelf/docs/navigation.ts", "detail": "Builds every nav catalog from eager import.meta.glob frontmatter reads - no hand-maintained metadata files" },
				{ "id": "component_sources_service", "label": "Component Source Puller", "kind": "service", "sourceRef": "src/siteshelf/docs/component-sources.ts" },
				{ "id": "highlight_service", "label": "Syntax Highlighter", "kind": "service", "sourceRef": "src/siteshelf/server/highlight.ts", "detail": "Server/build-time-only Shiki wrapper, so the client bundle never ships Shiki" },
				{ "id": "page_markdown_service", "label": "Raw Markdown Server", "kind": "service", "sourceRef": "src/siteshelf/server/page-markdown.ts" },
				{ "id": "itempulls_service", "label": "Package Export Cross-Check", "kind": "service", "sourceRef": "src/siteshelf/utils/itempulls.ts", "detail": "Reads the actual built barrels at build time so docs can never drift from real package exports" },
				{ "id": "demo_highlight_service", "label": "Demo Snippet Prebuilder", "kind": "service", "sourceRef": "src/siteshelf/docs/demo-highlight.ts" },
				{ "id": "seo_service", "label": "SEO Builder", "kind": "service", "sourceRef": "src/siteshelf/comps/seo.ts" },
				{ "id": "content_components_store", "label": "Component Docs (.md)", "kind": "store", "sourceRef": "src/siteshelf/content/components/*.md", "detail": "47 files - one MDsveX file per component; frontmatter is the single source of truth for page + nav" },
				{ "id": "content_blocks_store", "label": "Block Docs (.md)", "kind": "store", "sourceRef": "src/siteshelf/content/blocks/*.md" },
				{ "id": "content_motion_store", "label": "Motion Docs (.md)", "kind": "store", "sourceRef": "src/siteshelf/content/motion/*.md" },
				{ "id": "routes_docs_store", "label": "Guide Docs (.md)", "kind": "store", "sourceRef": "src/routes/docs/*.md", "detail": "11 numbered guides, 01-introduction through 11-acknowledgements" },
				{ "id": "lib_components_source_store", "label": "Component Source Files", "kind": "store", "sourceRef": "src/lib/components/**" },
				{ "id": "appshell", "label": "Site Appshell", "kind": "component", "sourceRef": "src/siteshelf/comps/Appshell.svelte", "detail": "Site-only chrome, not published in the package" },
				{ "id": "toast_site", "label": "Site Toast", "kind": "component", "sourceRef": "src/siteshelf/comps/Toast.svelte" },
				{ "id": "lib_public_components", "label": "fractalsvelte", "kind": "component", "sub": "public entrypoint", "sourceRef": "src/lib/index.ts", "detail": "47 component families - compound (Root/Trigger/Content) plus standalone monolithic variants" },
				{ "id": "lib_public_blocks", "label": "fractalsvelte/blocks", "kind": "component", "sub": "public entrypoint", "sourceRef": "src/lib/blocks/index.ts", "detail": "6 layout blocks: AppShell, Grid, Hero, NavigationSidebar, PageHeader, SplitLayout" },
				{ "id": "lib_public_motion", "label": "fractalsvelte/motion", "kind": "component", "sub": "public entrypoint", "sourceRef": "src/lib/motion/index.ts", "detail": "Motion, MotionProvider, AnimatePresence, Layout/SharedLayout, Drag/DropZone, Reorder" },
				{ "id": "lib_internal_motion", "label": "Internal Motion Policy", "kind": "component", "sub": "NOT exported", "sourceRef": "src/lib/internal/motion/", "detail": "reduced-motion.svelte.ts is the single most-connected node in the codebase - 34 edges" },
				{ "id": "style_system", "label": "SASS Token System", "kind": "style", "sourceRef": "src/lib/styles/index.sass", "detail": "CSS custom-property tokens only - no Tailwind, no CSS-in-JS, indented SASS exclusively" },
				{ "id": "vite_tool", "label": "Vite", "kind": "tool", "domain": "vitejs.dev" },
				{ "id": "mdsvex_tool", "label": "MDsveX", "kind": "tool", "domain": "mdsvex.pngwn.io" },
				{ "id": "shiki_tool", "label": "Shiki", "kind": "tool", "domain": "shiki.style" },
				{ "id": "vercel_og_integration", "label": "@vercel/og", "kind": "integration", "domain": "vercel.com" },
				{ "id": "fractals_styler_integration", "label": "fractals-styler", "kind": "integration", "domain": "npmjs.com" }
			],
			"edges": [
				{ "from": "root_layout", "to": "appshell", "kind": "renders" },
				{ "from": "root_layout", "to": "seo_service", "kind": "calls", "label": "reads page.data.seo, falls back to defaultSeo" },
				{ "from": "root_layout", "to": "toast_site", "kind": "renders" },
				{ "from": "root_layout", "to": "style_system", "kind": "imports", "label": "package SASS, then site SASS/typography, then the styler virtual CSS" },
				{ "from": "root_layout", "to": "fractals_styler_integration", "kind": "uses" },
				{ "from": "root_layout", "to": "vite_tool", "kind": "uses", "label": "virtual:fractals-styler.css only resolves through Vite's plugin pipeline" },
				{ "from": "home_page", "to": "docs_index", "kind": "triggers", "label": "\"Get Started\" CTA links to /docs/01-introduction" },
				{ "from": "components_index", "to": "navigation_service", "kind": "reads" },
				{ "from": "components_detail", "to": "navigation_service", "kind": "reads", "label": "getComponentBySlug() resolves the route param" },
				{ "from": "components_detail", "to": "component_sources_service", "kind": "calls", "label": "pulls raw source for the copy-paste panel" },
				{ "from": "components_detail", "to": "highlight_service", "kind": "calls" },
				{ "from": "components_detail", "to": "seo_service", "kind": "calls" },
				{ "from": "components_md_export", "to": "page_markdown_service", "kind": "calls" },
				{ "from": "blocks_index", "to": "navigation_service", "kind": "reads" },
				{ "from": "blocks_detail", "to": "navigation_service", "kind": "reads" },
				{ "from": "blocks_detail", "to": "component_sources_service", "kind": "calls" },
				{ "from": "blocks_detail", "to": "highlight_service", "kind": "calls" },
				{ "from": "blocks_md_export", "to": "page_markdown_service", "kind": "calls" },
				{ "from": "motion_index", "to": "navigation_service", "kind": "reads" },
				{ "from": "motion_detail", "to": "navigation_service", "kind": "reads" },
				{ "from": "motion_md_export", "to": "page_markdown_service", "kind": "calls" },
				{ "from": "docs_index", "to": "navigation_service", "kind": "reads", "label": "documentGroups buckets 11 guides by category for the sidebar" },
				{ "from": "docs_detail", "to": "routes_docs_store", "kind": "reads" },
				{ "from": "sitemap_route", "to": "navigation_service", "kind": "reads", "label": "flattens all four nav catalogs into one prerendered URL list" },
				{ "from": "og_image_route", "to": "navigation_service", "kind": "reads" },
				{ "from": "og_image_route", "to": "vercel_og_integration", "kind": "calls", "label": "ImageResponse rasterizes a 1200x630 PNG, no headless browser" },
				{ "from": "navigation_service", "to": "content_components_store", "kind": "reads", "label": "eager glob of frontmatter - single source of truth for page + nav" },
				{ "from": "navigation_service", "to": "content_blocks_store", "kind": "reads" },
				{ "from": "navigation_service", "to": "content_motion_store", "kind": "reads" },
				{ "from": "navigation_service", "to": "routes_docs_store", "kind": "reads" },
				{ "from": "component_sources_service", "to": "lib_components_source_store", "kind": "reads", "label": "lazy globs real source so demos can never drift from the published package" },
				{ "from": "mdsvex_tool", "to": "content_components_store", "kind": "transforms", "label": "compiles frontmatter + prose .md into Svelte-renderable output at build time" },
				{ "from": "itempulls_service", "to": "lib_public_components", "kind": "reads", "label": "cross-checks docs against real exports so nothing undocumented ships" },
				{ "from": "itempulls_service", "to": "lib_public_blocks", "kind": "reads" },
				{ "from": "itempulls_service", "to": "lib_public_motion", "kind": "reads" },
				{ "from": "demo_highlight_service", "to": "highlight_service", "kind": "calls", "label": "shares the same Shiki highlighter instance - found duplicated across 3 files independently" },
				{ "from": "highlight_service", "to": "shiki_tool", "kind": "calls" },
				{ "from": "lib_public_components", "to": "lib_internal_motion", "kind": "calls", "label": "every compound overlay (dialog, dropdown, sheet, popover, tooltip, menubar...) wires through one reduced-motion policy" },
				{ "from": "lib_public_motion", "to": "lib_internal_motion", "kind": "calls", "label": "public motion API defers all reduced-motion gating to the internal policy" },
				{ "from": "lib_public_components", "to": "style_system", "kind": "imports", "label": "every component consumes shared CSS custom-property tokens - zero one-off colors found" },
				{ "from": "lib_public_blocks", "to": "style_system", "kind": "imports" }
			]
		}
	};

	// Column layouts
	const COLUMNS_MAPPING = {
		'entry': 0,
		'service': 1,
		'store': 2,
		'component': 3,
		'style': 3,
		'tool': 4,
		'integration': 4
	};

	const COLUMN_LABELS = [
		'Entries & Routes',
		'Services & Engine',
		'Content Stores',
		'Public API & Style',
		'Tools & Config'
	];

	const KIND_COLORS: Record<string, string> = {
		entry: '#38bdf8',
		service: '#a78bfa',
		store: '#fbbf24',
		component: '#34d399',
		style: '#f43f5e',
		tool: '#2dd4bf',
		integration: '#fb923c'
	};

	const CARD_W = 200;
	const CARD_H = 54;
	const COL_GAP = 120;
	const ROW_H = 72;
	const HEADER_H = 60;
	const PAD = 40;

	// Svelte 5 Runes for Viewport state
	let hoverId = $state<string | null>(null);
	let selectedId = $state<string | null>(null);
	let searchQuery = $state<string>('');
	let view = $state({ x: 30, y: 20, k: 0.85 });
	let panning = $state(false);

	let viewportEl = $state<HTMLDivElement | null>(null);

	// SVG Edge Path drawing
	function edgePath(a: any, b: any) {
		const ay = a.y + CARD_H / 2;
		const by = b.y + CARD_H / 2;
		if (a.col === b.col) {
			const x = a.x;
			return `M ${x} ${ay} C ${x - 60} ${ay}, ${x - 60} ${by}, ${x} ${by}`;
		}
		let x1: number, x2: number;
		if (b.col > a.col) {
			x1 = a.x + CARD_W;
			x2 = b.x;
		} else {
			x1 = a.x;
			x2 = b.x + CARD_W;
		}
		const k = Math.min(160, Math.max(40, Math.abs(x2 - x1) * 0.5));
		const s = x2 > x1 ? 1 : -1;
		return `M ${x1} ${ay} C ${x1 + s * k} ${ay}, ${x2 - s * k} ${by}, ${x2} ${by}`;
	}

	function computeLayout(scan: typeof DATA) {
		const nodesById: Record<string, any> = {};
		const degree: Record<string, number> = {};
		const adjacency: Record<string, Record<string, boolean>> = {};
		const incoming: Record<string, { id: string; label: string; kind: string }[]> = {};
		const outgoing: Record<string, { id: string; label: string; kind: string }[]> = {};

		scan.graph.nodes.forEach((n: any) => {
			nodesById[n.id] = n;
			degree[n.id] = 0;
			adjacency[n.id] = {};
			incoming[n.id] = [];
			outgoing[n.id] = [];
		});

		scan.graph.edges.forEach((e: any) => {
			const source = nodesById[e.from];
			const target = nodesById[e.to];
			if (!source || !target) return;

			degree[e.from]++;
			degree[e.to]++;
			adjacency[e.from][e.to] = true;
			adjacency[e.to][e.from] = true;
			
			outgoing[e.from].push({ id: e.to, label: target.label, kind: e.kind });
			incoming[e.to].push({ id: e.from, label: source.label, kind: e.kind });
		});

		const columnsData: any[][] = [[], [], [], [], []];
		scan.graph.nodes.forEach((n: any) => {
			const colIdx = COLUMNS_MAPPING[n.kind as keyof typeof COLUMNS_MAPPING] ?? 0;
			columnsData[colIdx].push(n);
		});

		columnsData.forEach((colNodes) => {
			colNodes.sort((a, b) => degree[b.id] - degree[a.id]);
		});

		const maxRows = Math.max(...columnsData.map(col => col.length));
		const nodesList: any[] = [];
		const layoutNodesById: Record<string, any> = {};

		columnsData.forEach((colNodes, colIdx) => {
			colNodes.forEach((n, rowIdx) => {
				const layoutNode = {
					...n,
					col: colIdx,
					row: rowIdx,
					x: PAD + colIdx * (CARD_W + COL_GAP),
					y: PAD + HEADER_H + rowIdx * ROW_H,
					degree: degree[n.id]
				};
				nodesList.push(layoutNode);
				layoutNodesById[n.id] = layoutNode;
			});
		});

		const columns = COLUMN_LABELS.map((label, colIdx) => ({
			id: colIdx,
			label,
			x: PAD + colIdx * (CARD_W + COL_GAP)
		}));

		const edgesList: any[] = [];
		scan.graph.edges.forEach((e: any) => {
			const a = layoutNodesById[e.from];
			const b = layoutNodesById[e.to];
			if (!a || !b) return;
			edgesList.push({
				from: e.from,
				to: e.to,
				kind: e.kind,
				label: e.label,
				d: edgePath(a, b)
			});
		});

		const width = PAD * 2 + 5 * CARD_W + 4 * COL_GAP;
		const height = PAD * 2 + HEADER_H + maxRows * ROW_H;

		return {
			columns,
			nodes: nodesList,
			nodesById: layoutNodesById,
			edges: edgesList,
			adjacency,
			incoming,
			outgoing,
			width,
			height
		};
	}

	const layout = $derived(computeLayout(DATA));
	const selectedNode = $derived(selectedId ? layout.nodesById[selectedId] : null);

	// Search matching
	const searchSet = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return null;
		const set = new Set<string>();
		layout.nodes.forEach((n) => {
			if (
				n.label.toLowerCase().includes(q) ||
				n.id.toLowerCase().includes(q) ||
				(n.detail && n.detail.toLowerCase().includes(q)) ||
				(n.sourceRef && n.sourceRef.toLowerCase().includes(q))
			) {
				set.add(n.id);
			}
		});
		return set;
	});

	function zoomBy(factor: number) {
		if (!viewportEl) return;
		const cx = viewportEl.clientWidth / 2;
		const cy = viewportEl.clientHeight / 2;
		const newK = Math.min(2.0, Math.max(0.2, view.k * factor));
		view = {
			k: newK,
			x: cx - (cx - view.x) * (newK / view.k),
			y: cy - (cy - view.y) * (newK / view.k)
		};
	}

	function fitToView() {
		if (!viewportEl) return;
		const vw = viewportEl.clientWidth;
		const vh = viewportEl.clientHeight;
		if (!vw || !vh) return;
		const scale = Math.min((vw - 80) / layout.width, (vh - 80) / layout.height, 1);
		view = {
			k: scale,
			x: (vw - layout.width * scale) / 2,
			y: (vh - layout.height * scale) / 2
		};
	}

	let panStart = { x: 0, y: 0, vx: 0, vy: 0 };
	let hasMovedDuringPan = false;

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		if ((e.target as HTMLElement).closest('.fsg-node')) return;
		panning = true;
		hasMovedDuringPan = false;
		panStart = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
		viewportEl?.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!panning) return;
		const dx = e.clientX - panStart.x;
		const dy = e.clientY - panStart.y;
		if (Math.abs(dx) + Math.abs(dy) > 3) {
			hasMovedDuringPan = true;
		}
		view = {
			k: view.k,
			x: panStart.vx + dx,
			y: panStart.vy + dy
		};
	}

	function handlePointerUp(e: PointerEvent) {
		if (!panning) return;
		panning = false;
		viewportEl?.releasePointerCapture(e.pointerId);
		if (!hasMovedDuringPan) {
			selectedId = null;
		}
	}

	$effect(() => {
		if (layout) {
			fitToView();
		}
	});

	onMount(() => {
		const onWheel = (e: WheelEvent) => {
			if (!viewportEl) return;
			e.preventDefault();
			const rect = viewportEl.getBoundingClientRect();
			const mx = e.clientX - rect.left;
			const my = e.clientY - rect.top;
			const newK = Math.min(2.0, Math.max(0.2, view.k * Math.exp(-e.deltaY * 0.0015)));
			view = {
				k: newK,
				x: mx - (mx - view.x) * (newK / view.k),
				y: my - (my - view.y) * (newK / view.k)
			};
		};
		viewportEl?.addEventListener('wheel', onWheel, { passive: false });
		return () => {
			viewportEl?.removeEventListener('wheel', onWheel);
		};
	});

	function getTracing(hoverIdVal: string | null, selectedIdVal: string | null) {
		const focus = hoverIdVal || selectedIdVal;
		if (!focus) return null;
		
		const tracingSet = new Set<string>([focus]);
		const activeAdjacency = layout.adjacency[focus];
		if (activeAdjacency) {
			Object.keys(activeAdjacency).forEach(adjId => tracingSet.add(adjId));
		}
		return tracingSet;
	}

	const tracingSet = $derived(getTracing(hoverId, selectedId));
</script>

<div class="fsg-container">
	<div class="fsg-grid-bg"></div>
	<div class="fsg-glow"></div>

	<!-- Top Header -->
	<header class="fsg-header">
		<div class="fsg-brand">
			<h1>{DATA.project.name}</h1>
			<p>{DATA.project.tagline}</p>
		</div>
		<div class="fsg-meta-chips">
			<div class="fsg-chip"><b>{DATA.project.date}</b><span>release</span></div>
			<div class="fsg-chip"><b>{layout.nodes.length}</b><span>nodes</span></div>
			<div class="fsg-chip"><b>{layout.edges.length}</b><span>edges</span></div>
		</div>
	</header>

	<div class="fsg-body">
		<!-- Left Sidebar -->
		<aside class="fsg-left-rail">
			<div>
				<h3 class="fsg-section-title">Search Content</h3>
				<input
					class="fsg-search"
					placeholder="Search nodes, paths, details..."
					bind:value={searchQuery}
				/>
			</div>

			<div>
				<h3 class="fsg-section-title">Core Ecosystem Stats</h3>
				<div class="fsg-tech-card">
					<span class="label">Vite Tools</span>
					<span class="domain">{DATA.stats.tools} active</span>
				</div>
				<div class="fsg-tech-card">
					<span class="label">Integrations</span>
					<span class="domain">{DATA.stats.integrations} verified</span>
				</div>
			</div>

			<div>
				<h3 class="fsg-section-title">Top Compiler Tools</h3>
				{#each DATA.topTools as tool}
					<div class="fsg-tech-card" style="border-left: 3px solid #2dd4bf">
						<span class="label">{tool.label}</span>
						<span class="domain">{tool.domain}</span>
					</div>
				{/each}
			</div>

			<div>
				<h3 class="fsg-section-title">Ecosystem Integrations</h3>
				{#each DATA.topIntegrations as integration}
					<div class="fsg-tech-card" style="border-left: 3px solid #fb923c">
						<span class="label">{integration.label}</span>
						<span class="domain">{integration.domain}</span>
					</div>
				{/each}
			</div>
		</aside>

		<!-- Visual Zoomable/Pannable Viewport -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fsg-viewport-container {panning ? 'panning' : ''}"
			bind:this={viewportEl}
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
		>
			<div
				class="fsg-canvas"
				style="width: {layout.width}px; height: {layout.height}px; transform: translate({view.x}px, {view.y}px) scale({view.k});"
			>
				<!-- Connections SVG -->
				<svg class="fsg-edges" width={layout.width} height={layout.height}>
					{#each layout.edges as edge}
						{@const isSourceFocus = hoverId === edge.from || selectedId === edge.from}
						{@const isTargetFocus = hoverId === edge.to || selectedId === edge.to}
						{@const isHighlighted = tracingSet ? (tracingSet.has(edge.from) && tracingSet.has(edge.to) && (isSourceFocus || isTargetFocus)) : false}
						{@const isDimmed = tracingSet ? !isHighlighted : false}
						<path
							class="fsg-edge"
							class:highlighted={isHighlighted}
							class:dimmed={isDimmed}
							d={edge.d}
							stroke={KIND_COLORS[layout.nodesById[edge.from]?.kind] || '#64748b'}
						/>
					{/each}
				</svg>

				<!-- Column Headers -->
				{#each layout.columns as col}
					<div class="fsg-col-header" style="left: {col.x}px">
						{col.label}
					</div>
				{/each}

				<!-- Interactive Node Nodes -->
				{#each layout.nodes as node}
					{@const isSelected = selectedId === node.id}
					{@const isHighlighted = tracingSet ? tracingSet.has(node.id) : (searchSet ? searchSet.has(node.id) : false)}
					{@const isDimmed = (tracingSet || searchSet) ? !isHighlighted : false}
					
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						class="fsg-node"
						class:selected={isSelected}
						class:highlighted={isHighlighted}
						class:dimmed={isDimmed}
						style="left: {node.x}px; top: {node.y}px; --node-color: {KIND_COLORS[node.kind]}"
						role="button"
						tabindex="0"
						onclick={() => selectedId = selectedId === node.id ? null : node.id}
						onpointerenter={() => hoverId = node.id}
						onpointerleave={() => { if (hoverId === node.id) hoverId = null; }}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectedId = node.id; }}
					>
						<span class="fsg-node-title">{node.label}</span>
						<span class="fsg-node-subtitle">{node.sub || node.kind}</span>
					</div>
				{/each}
			</div>

			<!-- Control Controls -->
			<div class="fsg-controls">
				<button class="fsg-btn" title="Zoom Out" onclick={() => zoomBy(1 / 1.25)}>−</button>
				<button class="fsg-btn" style="width: auto; font-size: 10px; font-weight: 700; padding: 0 4px;" disabled>
					{Math.round(view.k * 100)}%
				</button>
				<button class="fsg-btn" title="Zoom In" onclick={() => zoomBy(1.25)}>+</button>
				<button class="fsg-btn" title="Fit Canvas" onclick={fitToView}>⛶</button>
			</div>
		</div>

		<!-- Right Rail Sidebar Details -->
		<aside class="fsg-right-rail">
			{#if selectedNode}
				<div>
					<span
						class="fsg-kindchip"
						style="background: {KIND_COLORS[selectedNode.kind]}20; border: 1px solid {KIND_COLORS[selectedNode.kind]}40; color: {KIND_COLORS[selectedNode.kind]}; padding: 3px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase;"
					>
						{selectedNode.kind}
					</span>
					<h2 class="ahs-side-title" style="margin-top: 10px;">{selectedNode.label}</h2>
					{#if selectedNode.sub}
						<div class="fsg-node-subtitle" style="color: var(--text-secondary); margin-bottom: var(--sz-12)">
							{selectedNode.sub}
						</div>
					{/if}
				</div>

				{#if selectedNode.detail}
					<div>
						<h4 class="fsg-section-title">Context & Behavior</h4>
						<p class="ahs-summary">{selectedNode.detail}</p>
					</div>
				{/if}

				{#if selectedNode.sourceRef}
					<div>
						<h4 class="fsg-section-title">Source Reference</h4>
						<div class="ahs-path" style="background: var(--background20); border: 1px solid var(--border-primary); padding: var(--sz-8); border-radius: var(--sz-6);">
							{selectedNode.sourceRef}
						</div>
					</div>
				{/if}

				<!-- Incoming relationships -->
				<div>
					<h4 class="fsg-section-title">Incoming Traces ({layout.incoming[selectedNode.id]?.length || 0})</h4>
					{#each layout.incoming[selectedNode.id] || [] as rel}
						<button class="fsg-relation-item" onclick={() => selectedId = rel.id}>
							<span class="target">{rel.label}</span>
							<span class="kind">{rel.kind}</span>
						</button>
					{/each}
				</div>

				<!-- Outgoing relationships -->
				<div>
					<h4 class="fsg-section-title">Outgoing Traces ({layout.outgoing[selectedNode.id]?.length || 0})</h4>
					{#each layout.outgoing[selectedNode.id] || [] as rel}
						<button class="fsg-relation-item" onclick={() => selectedId = rel.id}>
							<span class="target">{rel.label}</span>
							<span class="kind">{rel.kind}</span>
						</button>
					{/each}
				</div>
			{:else}
				<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); text-align: center; padding: 20px;">
					<div>
						<div style="font-size: 32px; margin-bottom: 12px; opacity: 0.6;">✧</div>
						<p style="font-size: var(--text-sm)">Click a node on the canvas to inspect its architecture properties and dependency pathways.</p>
					</div>
				</div>
			{/if}
		</aside>
	</div>
</div>
