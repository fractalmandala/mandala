<script>
  import '@xyflow/svelte/dist/style.css';
  import GraphCanvas from './GraphCanvas.svelte';
  import TreemapCanvas from './TreemapCanvas.svelte';
  import { layoutGraph } from './layout.js';

  const scan = window.__SCAN__;
  const isHealth = scan.scan === 'health';

  // ---------------------------------------------------------------- palette
  const LAYER_COLOR = {
    'import:internal': '#5c7cfa', 'import:cross-package': '#f4a261',
    'style:class': '#c084fc', 'style:token': '#2dd4bf', 'style:mixin': '#f472b6', 'style:import': '#94a3b8',
    renders: '#5c7cfa', imports: '#7c8aa5', reads: '#2dd4bf', writes: '#f4a261',
    calls: '#a78bfa', commands: '#fbbf24', dispatches: '#fb923c', listens: '#38bdf8',
    ipc: '#f472b6', navigates: '#4ade80', triggers: '#fbbf24', uses: '#94a3b8',
    transforms: '#c084fc', allowed: '#64748b', violation: '#ef4444'
  };
  const layerOf = (e) => e.layer ?? e.kind ?? 'edge';
  const colorOf = (l) => LAYER_COLOR[l] ?? '#8b93a7';
  const LAYER_LABEL = {
    'import:internal': 'imports (internal)', 'import:cross-package': 'imports (cross-package)',
    'style:class': 'css classes', 'style:token': 'design tokens',
    'style:mixin': 'sass mixins', 'style:import': 'stylesheet @use'
  };
  const SEV = { alert: '#ef4444', warn: '#fbbf24', info: '#5c7cfa' };

  // ------------------------------------------------- normalise the graph
  // `group` becomes containment, so system swim-lanes reuse the whole nesting
  // machinery (drill, collapse, edge-lifting) instead of needing their own.
  const rawNodes = scan.nodes ?? [];
  const groupDefs = scan.groups ?? [];
  const nodesIn = [];
  if (!isHealth) {
    const used = new Set(rawNodes.map((n) => n.group).filter(Boolean));
    for (const g of groupDefs) {
      if (!used.has(g.id)) continue;
      nodesIn.push({ id: `group:${g.id}`, kind: 'dir', label: g.label ?? g.id, parentId: null, data: { files: 0, loc: 0, lane: true } });
    }
    for (const n of rawNodes) {
      nodesIn.push({
        ...n,
        parentId: n.parentId ?? (n.group && used.has(n.group) ? `group:${n.group}` : null),
        data: { files: 0, loc: 0, ...(n.data ?? {}) }
      });
    }
  }

  const graph = { meta: scan, nodes: nodesIn, edges: (scan.edges ?? []).map((e, i) => ({ ...e, id: e.id ?? `e${i}`, layer: layerOf(e), weight: e.weight ?? 1 })) };
  const layers = [...new Set(graph.edges.map((e) => e.layer))];

  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const kidsOf = new Map();
  for (const n of graph.nodes) {
    const k = n.parentId ?? '__root__';
    if (!kidsOf.has(k)) kidsOf.set(k, []);
    kidsOf.get(k).push(n);
  }
  const roots = kidsOf.get('__root__') ?? [];
  const HUES = [212, 158, 32, 280, 8, 190, 96, 330];
  const hueOf = new Map();
  roots.forEach((r, i) => {
    const h = HUES[i % HUES.length];
    const paint = (id) => { hueOf.set(id, h); (kidsOf.get(id) ?? []).forEach((c) => paint(c.id)); };
    paint(r.id);
  });
  const descendantCount = (id) => (kidsOf.get(id) ?? []).reduce((a, c) => a + 1 + descendantCount(c.id), 0);
  const ancestorsOf = (id) => { const out = []; let c = byId.get(id)?.parentId; while (c) { out.push(c); c = byId.get(c)?.parentId; } return out; };

  const flows = scan.flows ?? [];
  const notes = scan.notes ?? [];

  // --------------------------------------------------------------- state
  const defaultCollapsed = () => new Set(
    graph.nodes.filter((n) => (n.kind === 'package' || n.data?.lane) && (kidsOf.get(n.id) ?? []).length).map((n) => n.id)
  );
  let collapsed = $state(defaultCollapsed());
  let activeLayers = $state(new Set(layers));
  let minWeight = $state(scan.scan === 'layout' ? 3 : 1);
  let query = $state('');
  let selected = $state(null);
  let activeFlow = $state(null);
  let busy = $state(!isHealth);
  let fitToken = $state(0);
  let nodes = $state.raw([]);
  let edges = $state.raw([]);

  const flow = $derived(activeFlow ? flows.find((f) => f.id === activeFlow) : null);
  const flowSteps = $derived(flow?.steps ?? []);
  const onPath = $derived(new Set(flowSteps));

  function toggle(id) {
    const next = new Set(collapsed);
    next.has(id) ? next.delete(id) : next.add(id);
    collapsed = next;
  }
  const expandAll = () => (collapsed = new Set());
  const collapseAll = () => (collapsed = defaultCollapsed());

  function pickFlow(id) {
    if (activeFlow === id) { activeFlow = null; return; }
    activeFlow = id;
    // reveal every step: open its ancestors, but leave the step itself folded
    const f = flows.find((x) => x.id === id);
    if (!f) return;
    const next = new Set(collapsed);
    for (const s of f.steps) for (const a of ancestorsOf(s)) next.delete(a);
    collapsed = next;
  }

  async function relayout() {
    busy = true;
    const { positions, visible, edges: lifted } = await layoutGraph(graph, {
      collapsed,
      preset: scan.scan === 'system' ? 'lanes' : 'layout'
    });

    const ordered = [];
    const push = (n) => {
      if (!visible.has(n.id)) return;
      ordered.push(n);
      if (!collapsed.has(n.id)) (kidsOf.get(n.id) ?? []).forEach(push);
    };
    roots.forEach(push);

    // a step deep inside a collapsed box still lights up: lift it to what's visible
    const liftVisible = (id) => { let c = id; while (c && !visible.has(c)) c = byId.get(c)?.parentId ?? null; return c; };
    const litSteps = flowSteps.map(liftVisible).filter(Boolean);
    const lit = new Set(litSteps);
    const stepIndex = new Map();
    litSteps.forEach((id, i) => { if (!stepIndex.has(id)) stepIndex.set(id, i + 1); });

    const q = query.trim().toLowerCase();
    nodes = ordered.map((n) => {
      const p = positions.get(n.id) ?? { x: 0, y: 0, width: 190, height: 52 };
      const hasChildren = (kidsOf.get(n.id) ?? []).length > 0;
      const matches = q ? (n.id + ' ' + (n.label ?? '')).toLowerCase().includes(q) : false;
      return {
        id: n.id,
        type: 'box',
        position: { x: p.x, y: p.y },
        width: p.width, height: p.height,
        style: `width:${p.width}px;height:${p.height}px`,
        parentId: n.parentId ?? undefined,
        extent: n.parentId ? 'parent' : undefined,
        data: {
          label: n.label ?? n.id,
          kind: n.kind,
          sub: n.sub,
          files: n.data.totalFiles ?? n.data.files ?? 0,
          loc: n.data.totalLoc ?? n.data.loc ?? 0,
          hue: hueOf.get(n.id) ?? 212,
          defines: n.data.defines,
          lane: n.data.lane,
          hasChildren,
          collapsed: collapsed.has(n.id),
          hiddenCount: collapsed.has(n.id) ? descendantCount(n.id) : 0,
          step: stepIndex.get(n.id) ?? 0,
          match: matches,
          dim: (q && !matches) || (flow && !lit.has(n.id) && !n.data.lane),
          onToggle: toggle
        }
      };
    });

    const base = lifted
      .filter((e) => activeLayers.has(e.layer) && e.weight >= minWeight)
      .filter((e) => !flow || (lit.has(e.source) && lit.has(e.target)))
      .map((e) => ({
        id: e.id, source: e.source, target: e.target,
        animated: e.layer === 'import:cross-package',
        style: `stroke:${colorOf(e.layer)};stroke-width:${Math.min(6, 0.8 + Math.log2(e.weight))};` +
               `opacity:${flow ? 0.25 : e.layer.startsWith('style:') ? 0.7 : e.layer === 'import:cross-package' ? 0.85 : 0.4};` +
               (e.layer.startsWith('style:') ? 'stroke-dasharray:2 4;' : ''),
        label: !flow && e.weight >= 25 ? String(e.weight) : undefined,
        data: { weight: e.weight, layer: e.layer }
      }));

    // the flow path is drawn explicitly, so a narrative step with no literal
    // edge behind it still shows as part of the journey
    const path = [];
    for (let i = 0; i < litSteps.length - 1; i++) {
      if (litSteps[i] === litSteps[i + 1]) continue;
      path.push({
        id: `flow-${i}`, source: litSteps[i], target: litSteps[i + 1],
        animated: true, zIndex: 1000,
        style: 'stroke:#ffd166;stroke-width:3;opacity:1',
        label: String(i + 1),
        labelStyle: 'fill:#0c0e14;font-weight:700',
        labelBgStyle: 'fill:#ffd166'
      });
    }

    edges = [...base, ...path];
    busy = false;
    fitToken++;
  }

  $effect(() => {
    if (isHealth) return;
    collapsed; activeLayers; minWeight; query; activeFlow;
    relayout();
  });

  function toggleLayer(l) {
    const n = new Set(activeLayers);
    n.has(l) ? n.delete(l) : n.add(l);
    activeLayers = n;
  }

  const fmt = (n) => (typeof n === 'number' ? n.toLocaleString() : n);
  const sel = $derived(selected ? (isHealth ? (scan.files ?? []).find((f) => f.path === selected) : byId.get(selected)) : null);
  const selEdges = $derived(selected && !isHealth ? graph.edges.filter((e) => e.source === selected || e.target === selected) : []);
  const selFlows = $derived(selected ? flows.filter((f) => f.steps.includes(selected)) : []);
  const statEntries = $derived(Object.entries(scan.stats ?? {}).filter(([, v]) => typeof v === 'number' && v > 0).slice(0, 8));
  const chips = $derived([...(scan.topTools ?? []), ...(scan.topIntegrations ?? []), ...(scan.topModels ?? [])]);
</script>

<div class="app">
  <aside>
    <h1>{scan.project?.name ?? 'scan'}</h1>
    <p class="sub">{scan.scan} scan · {scan.project?.date ?? ''}</p>
    {#if scan.project?.tagline}<p class="tag">{scan.project.tagline}</p>{/if}

    <div class="stats">
      {#each statEntries as [k, v]}
        <div><b>{fmt(v)}</b><span>{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span></div>
      {/each}
    </div>

    {#if chips.length}
      <span class="hdr">Stack</span>
      <div class="chips ch-sp">
        {#each chips as c}<span class="chip">{c.label}</span>{/each}
      </div>
    {/if}

    <label class="fld">
      <span>Find</span>
      <input placeholder={isHealth ? 'file path…' : 'path or label…'} bind:value={query} />
    </label>

    {#if flows.length}
      <span class="hdr">Flows <em>({flows.length})</em></span>
      <div class="flows">
        {#each flows as f}
          <button class="flow" class:on={activeFlow === f.id} onclick={() => pickFlow(f.id)}>
            <b>{f.name ?? f.id}</b>
            {#if f.trigger}<i>{f.trigger}</i>{/if}
            <span class="steps">{f.steps.length} steps</span>
          </button>
        {/each}
      </div>
      {#if flow}
        <ol class="path">
          {#each flow.steps as s, i}
            <li><em>{i + 1}</em><button onclick={() => (selected = s)}>{byId.get(s)?.label ?? s}</button></li>
          {/each}
        </ol>
        {#if flow.summary}<p class="fsum">{flow.summary}</p>{/if}
      {/if}
    {/if}

    {#if !isHealth}
      <div class="grp">
        <span class="hdr">Edge layers</span>
        {#each layers as l}
          <label class="chk">
            <input type="checkbox" checked={activeLayers.has(l)} onchange={() => toggleLayer(l)} />
            <i class="swatch" style="background:{colorOf(l)}"></i>
            {LAYER_LABEL[l] ?? l}
          </label>
        {/each}
      </div>

      <label class="fld">
        <span>Min edge weight <b>{minWeight}</b></span>
        <input type="range" min="1" max="40" bind:value={minWeight} />
      </label>

      <div class="btns">
        <button onclick={expandAll}>Expand all</button>
        <button onclick={collapseAll}>Collapse</button>
      </div>
    {/if}

    {#if notes.length}
      <span class="hdr">Findings</span>
      <div class="notes">
        {#each notes as n}
          <button class="note" style="--sev:{SEV[n.severity] ?? SEV.info}"
                  onclick={() => n.path && (selected = n.path)}>
            <b>{n.title}</b>
            <span>{n.body}</span>
            {#if n.path}<code>{n.path}</code>{/if}
          </button>
        {/each}
      </div>
    {/if}

    {#if sel}
      <div class="panel">
        <span class="hdr">Selected</span>
        <code>{selected}</code>
        {#if isHealth}
          <div class="kv"><span>LOC</span><b>{fmt(sel.loc)}</b></div>
          <div class="kv"><span>commits</span><b>{fmt(sel.commits)}</b></div>
          <div class="kv"><span>lines changed</span><b>{fmt(sel.linesChanged ?? 0)}</b></div>
          <div class="kv"><span>authors</span><b>{sel.authors}</b></div>
          <div class="kv"><span>complexity</span><b>{sel.complexity}</b></div>
          <div class="kv"><span>last commit</span><b>{sel.lastCommit}</b></div>
          {#if sel.summary}<p class="fsum">{sel.summary}</p>{/if}
        {:else}
          {#if sel.sub}<p class="fsum">{sel.sub}</p>{/if}
          <div class="kv"><span>kind</span><b>{sel.kind}</b></div>
          {#if sel.data?.totalFiles}<div class="kv"><span>files</span><b>{fmt(sel.data.totalFiles)}</b></div>{/if}
          {#if sel.data?.totalLoc}<div class="kv"><span>LOC</span><b>{fmt(sel.data.totalLoc)}</b></div>{/if}
          <div class="kv"><span>connections</span><b>{selEdges.length}</b></div>
          {#if sel.detail}<p class="fsum">{sel.detail}</p>{/if}
          {#if sel.sourceRef}<code class="src">{sel.sourceRef}</code>{/if}
          {#if selFlows.length}
            <span class="hdr sp">In flows</span>
            <div class="chips">
              {#each selFlows as f}<button class="chip lnk" onclick={() => pickFlow(f.id)}>{f.name ?? f.id}</button>{/each}
            </div>
          {/if}
          {#if selEdges.length}
            <ul>
              {#each selEdges.slice(0, 10) as e}
                <li>
                  <i style="color:{colorOf(e.layer)}">{e.source === selected ? '→' : '←'}</i>
                  <span class="peer">{(e.source === selected ? e.target : e.source).split('/').slice(-2).join('/')}</span>
                  <em style="color:{colorOf(e.layer)}">{(e.layer ?? '').split(':').pop()}</em>
                  <b>{e.weight}</b>
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      </div>

      {#if sel.data?.defines}
        <div class="panel">
          <span class="hdr">Defines</span>
          <div class="kv"><span>classes</span><b>{sel.data.defines.classes}</b></div>
          <div class="kv"><span>custom properties</span><b>{sel.data.defines.tokens}</b></div>
          {#if sel.data.defines.mixins}<div class="kv"><span>mixins</span><b>{sel.data.defines.mixins}</b></div>{/if}
          {#if sel.data.defines.layers?.length}
            <div class="kv"><span>@layer</span><b>{sel.data.defines.layers.join(', ')}</b></div>
          {/if}
          {#if sel.data.topClasses?.length}
            <span class="hdr sp">Most-used classes</span>
            <div class="chips">
              {#each sel.data.topClasses as c}<span class="chip cls">.{c.name}<b>{c.users}</b></span>{/each}
            </div>
          {/if}
          <span class="hdr sp">Editing this affects</span>
          <ul class="impact">
            {#each sel.data.defines.consumedBy.slice(0, 10) as c}<li>{c}</li>{/each}
          </ul>
          {#if sel.data.defines.consumedBy.length > 10}
            <p class="more">+{sel.data.defines.consumedBy.length - 10} more containers</p>
          {/if}
        </div>
      {/if}

      {#if sel.data?.styles}
        {@const st = sel.data.styles}
        <div class="panel">
          <span class="hdr">Styling</span>
          <div class="kv"><span>styled files</span><b>{st.filesStyled}</b></div>
          <div class="kv"><span>utility classes</span><b>{st.utilityDistinct} <em>/ {st.utilityUses} uses</em></b></div>
          {#if st.scopedBlocks}<div class="kv"><span>scoped blocks</span><b>{st.scopedBlocks} <em>/ {st.scopedClasses} cls</em></b></div>{/if}
          {#if st.recipeFiles}<div class="kv"><span>cva/tv recipes</span><b>{st.recipeFiles}</b></div>{/if}
          {#if st.authored.length}
            <span class="hdr sp">Authored classes <em>({st.authoredTotal})</em></span>
            <div class="chips">{#each st.authored as c}<span class="chip cls">.{c.name}<b>{c.count}</b></span>{/each}</div>
          {/if}
          {#if st.tokens.length}
            <span class="hdr sp">Design tokens <em>({st.tokensDistinct})</em></span>
            <div class="chips">{#each st.tokens as t}<span class="chip tok">{t.name}<b>{t.count}</b></span>{/each}</div>
          {/if}
          {#if st.mixins.length}
            <span class="hdr sp">Mixins</span>
            <div class="chips">{#each st.mixins as m}<span class="chip mix">@{m.name}<b>{m.count}</b></span>{/each}</div>
          {/if}
          {#if st.utilityTop.length}
            <span class="hdr sp">Top utilities</span>
            <div class="chips">{#each st.utilityTop as u}<span class="chip util">{u.name}<b>{u.count}</b></span>{/each}</div>
          {/if}
        </div>
      {/if}
    {/if}
  </aside>

  <main>
    {#if isHealth}
      <TreemapCanvas {scan} {selected} {query} onselect={(id) => (selected = id)} />
    {:else}
      <GraphCanvas bind:nodes bind:edges {fitToken} {busy} onselect={(id) => (selected = id)} />
    {/if}
  </main>
</div>

<style>
  :global(html, body) { margin: 0; height: 100%; background: #0c0e14; }
  :global(#app) { height: 100vh; }
  .app { display: flex; height: 100vh; font: 13px/1.45 ui-sans-serif, system-ui, sans-serif; color: #dfe3ec; }
  aside { width: 280px; flex: none; padding: 18px 16px; overflow-y: auto; background: #11141c; border-right: 1px solid #ffffff12; }
  main { flex: 1; position: relative; }
  h1 { font-size: 15px; margin: 0; }
  .sub { margin: 2px 0 4px; font-size: 11px; opacity: .45; }
  .tag { margin: 0 0 14px; font-size: 11px; opacity: .6; line-height: 1.4; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0 18px; }
  .stats div { background: #ffffff08; border-radius: 8px; padding: 8px 9px; }
  .stats b { display: block; font-size: 15px; font-variant-numeric: tabular-nums; }
  .stats span { font-size: 9.5px; opacity: .45; }
  .hdr { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .09em; opacity: .4; margin-bottom: 7px; }
  .hdr.sp { margin-top: 13px; }
  .hdr em, .kv b em { font-style: normal; opacity: .6; }
  .fld { display: block; margin-bottom: 16px; }
  .fld > span { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .09em; opacity: .4; margin-bottom: 6px; }
  input:not([type]) { width: 100%; box-sizing: border-box; background: #ffffff0d; border: 1px solid #ffffff1a; border-radius: 7px; padding: 7px 9px; color: inherit; font: inherit; font-size: 12px; }
  input[type=range] { width: 100%; accent-color: #5c7cfa; }
  .grp { margin-bottom: 16px; }
  .chk { display: flex; align-items: center; gap: 7px; font-size: 12px; margin-bottom: 5px; cursor: pointer; }
  .swatch { width: 16px; height: 3px; border-radius: 2px; flex: none; }
  .btns { display: flex; gap: 6px; margin-bottom: 16px; }
  .btns button { flex: 1; background: #ffffff0d; border: 1px solid #ffffff1a; color: inherit; border-radius: 7px; padding: 6px; font: inherit; font-size: 11px; cursor: pointer; }
  .btns button:hover { background: #ffffff18; }

  .flows { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
  .flow { text-align: left; background: #ffffff08; border: 1px solid #ffffff14; border-radius: 8px; padding: 7px 9px; color: inherit; font: inherit; cursor: pointer; }
  .flow:hover { background: #ffffff12; }
  .flow.on { background: #ffd1661a; border-color: #ffd16666; }
  .flow b { display: block; font-size: 12px; font-weight: 550; }
  .flow i { display: block; font-style: normal; font-size: 10px; opacity: .5; margin-top: 1px; }
  .flow .steps { font-size: 9.5px; opacity: .35; }
  ol.path { list-style: none; padding: 0; margin: 0 0 8px; }
  ol.path li { display: flex; align-items: center; gap: 7px; font-size: 11px; padding: 1px 0; }
  ol.path em { font-style: normal; width: 15px; height: 15px; flex: none; border-radius: 50%; background: #ffd166; color: #0c0e14; font-size: 9px; font-weight: 700; display: grid; place-items: center; }
  ol.path button { all: unset; cursor: pointer; opacity: .8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  ol.path button:hover { opacity: 1; text-decoration: underline; }
  .fsum { font-size: 11px; opacity: .6; line-height: 1.45; margin: 6px 0 14px; }

  .notes { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .note { text-align: left; background: #ffffff08; border: 1px solid #ffffff14; border-left: 2px solid var(--sev); border-radius: 7px; padding: 7px 9px; color: inherit; font: inherit; cursor: pointer; }
  .note:hover { background: #ffffff12; }
  .note b { display: block; font-size: 11.5px; color: var(--sev); }
  .note span { display: block; font-size: 10.5px; opacity: .6; line-height: 1.4; margin-top: 2px; }
  .note code { display: block; font-size: 9.5px; opacity: .4; margin-top: 3px; word-break: break-all; }

  .panel { border-top: 1px solid #ffffff12; padding-top: 14px; margin-bottom: 14px; }
  .panel > code { display: block; font-size: 10.5px; opacity: .7; word-break: break-all; margin-bottom: 9px; }
  code.src { display: block; font-size: 10px; opacity: .5; margin-top: 6px; word-break: break-all; }
  .kv { display: flex; justify-content: space-between; font-size: 11.5px; padding: 2px 0; gap: 8px; }
  .kv span { opacity: .45; }
  .panel ul { list-style: none; padding: 0; margin: 9px 0 0; font-size: 11px; }
  .panel li { display: flex; gap: 6px; padding: 2px 0; opacity: .75; align-items: center; }
  .panel li i { opacity: .6; font-style: normal; flex: none; }
  .panel li .peer { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .panel li em { font-style: normal; font-size: 9px; opacity: .55; flex: none; }
  .panel li b { margin-left: auto; font-variant-numeric: tabular-nums; opacity: .6; }
  .chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .chips.ch-sp { margin-bottom: 16px; }
  .chip { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; padding: 2px 5px; border-radius: 5px; background: #ffffff0d; border: 1px solid #ffffff14; font-family: ui-monospace, monospace; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: inherit; }
  .chip b { opacity: .4; font-weight: 500; }
  .chip.cls { color: #d8b4fe; border-color: #c084fc33; }
  .chip.tok { color: #5eead4; border-color: #2dd4bf33; }
  .chip.mix { color: #f9a8d4; border-color: #f472b633; }
  .chip.util { color: #9aa4bb; }
  .chip.lnk { cursor: pointer; color: #ffd166; border-color: #ffd16633; }
  ul.impact { list-style: none; padding: 0; margin: 0; font-size: 10.5px; }
  ul.impact li { padding: 2px 0; opacity: .65; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ui-monospace, monospace; display: block; }
  .more { font-size: 10px; opacity: .4; margin: 4px 0 0; }
</style>