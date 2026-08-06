<script>
  /**
   * Health canvas. No edges — a health scan is a metric heat map, and forcing
   * it into a node/edge graph would be a category error. Size = LOC,
   * colour = risk (churn x complexity), so the eye goes to big-and-red.
   */
  let { scan, selected, query, onselect } = $props();

  const files = scan.files ?? [];

  const maxCommits = Math.max(1, ...files.map((f) => f.commits));
  const risk = (f) => {
    const churn = Math.log1p(f.commits) / Math.log1p(maxCommits);   // 0..1, log — churn is heavy-tailed
    const cx = (f.complexity ?? 0) / 100;
    return Math.round((0.55 * churn + 0.45 * cx) * 100);
  };

  // Colour by rank within this repo, not by an absolute score. Absolute risk
  // clusters every file into the same muddy mid-band; the useful question is
  // always "which files here are the worst", so spread the scale across them.
  const ranked = (() => {
    const scored = files.map((f) => ({ ...f, raw: risk(f) })).sort((a, b) => a.raw - b.raw);
    const n = Math.max(1, scored.length - 1);
    scored.forEach((f, i) => { f.risk = Math.round((i / n) * 100); });
    return new Map(scored.map((f) => [f.path, f]));
  })();

  // group by top-level-ish directory so the map reads as the repo, not a blob
  const groups = $derived.by(() => {
    const g = new Map();
    for (const f of files) {
      const parts = f.path.split('/');
      const key = parts.slice(0, Math.min(2, parts.length - 1)).join('/') || '.';
      if (!g.has(key)) g.set(key, { key, files: [], loc: 0 });
      const b = g.get(key);
      b.files.push(ranked.get(f.path) ?? { ...f, risk: 0, raw: 0 });
      b.loc += f.loc;
    }
    return [...g.values()].sort((a, b) => b.loc - a.loc);
  });

  // squarified treemap
  function squarify(items, x, y, w, h) {
    const out = [];
    const total = items.reduce((a, i) => a + i.value, 0) || 1;
    let scaleArea = (w * h) / total;
    let rest = items.map((i) => ({ ...i, area: i.value * scaleArea }));
    let cx = x, cy = y, cw = w, ch = h;

    const worst = (row, len) => {
      const s = row.reduce((a, r) => a + r.area, 0);
      const mx = Math.max(...row.map((r) => r.area));
      const mn = Math.min(...row.map((r) => r.area));
      return Math.max((len * len * mx) / (s * s), (s * s) / (len * len * mn));
    };

    while (rest.length) {
      const horizontal = cw >= ch;
      const len = horizontal ? ch : cw;
      const row = [rest[0]];
      let i = 1;
      while (i < rest.length && worst([...row, rest[i]], len) <= worst(row, len)) row.push(rest[i++]);
      const rowArea = row.reduce((a, r) => a + r.area, 0);
      const thick = rowArea / len;
      let off = 0;
      for (const r of row) {
        const side = r.area / thick;
        out.push(horizontal
          ? { ...r, x: cx, y: cy + off, w: thick, h: side }
          : { ...r, x: cx + off, y: cy, w: side, h: thick });
        off += side;
      }
      if (horizontal) { cx += thick; cw -= thick; } else { cy += thick; ch -= thick; }
      rest = rest.slice(row.length);
      if (cw <= 0.5 || ch <= 0.5) break;
    }
    return out;
  }

  const W = 1000, H = 640, PAD = 3, HEAD = 15;

  const boxes = $derived.by(() => {
    const outer = squarify(groups.map((g) => ({ ...g, value: g.loc })), 0, 0, W, H);
    const all = [];
    for (const g of outer) {
      all.push({ type: 'group', ...g });
      const iw = Math.max(1, g.w - PAD * 2), ih = Math.max(1, g.h - PAD - HEAD);
      if (iw < 12 || ih < 12) continue;
      const inner = squarify(
        g.files.map((f) => ({ ...f, value: Math.max(f.loc, 1) })).sort((a, b) => b.value - a.value),
        g.x + PAD, g.y + HEAD, iw, ih
      );
      for (const f of inner) all.push({ type: 'file', ...f });
    }
    return all;
  });

  const heat = (r) => {
    // teal → amber → red
    const stops = [[0, '#2dd4bf'], [45, '#eab308'], [70, '#f97316'], [100, '#ef4444']];
    for (let i = 1; i < stops.length; i++) {
      if (r <= stops[i][0]) {
        const [a, ca] = stops[i - 1], [b, cb] = stops[i];
        const t = (r - a) / (b - a || 1);
        const mix = (h1, h2) => Math.round(parseInt(h1, 16) + (parseInt(h2, 16) - parseInt(h1, 16)) * t)
          .toString(16).padStart(2, '0');
        return `#${mix(ca.slice(1, 3), cb.slice(1, 3))}${mix(ca.slice(3, 5), cb.slice(3, 5))}${mix(ca.slice(5, 7), cb.slice(5, 7))}`;
      }
    }
    return '#ef4444';
  };

  const q = $derived(query.trim().toLowerCase());
  const hit = (p) => !q || p.toLowerCase().includes(q);
</script>

<div class="wrap">
  <svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet">
    {#each boxes as b (b.type + (b.path ?? b.key))}
      {#if b.type === 'group'}
        <g>
          <rect x={b.x} y={b.y} width={Math.max(0, b.w)} height={Math.max(0, b.h)}
                fill="#ffffff06" stroke="#ffffff18" rx="4" />
          {#if b.w > 60 && b.h > 20}
            <text x={b.x + 6} y={b.y + 11} class="glabel">{b.key}</text>
          {/if}
          {#if b.w > 150 && b.h > 20}
            <text x={b.x + b.w - 6} y={b.y + 11} class="gloc" text-anchor="end">{(b.loc / 1000).toFixed(1)}k</text>
          {/if}
        </g>
      {:else}
        <g
          class="file"
          class:sel={selected === b.path}
          class:dim={!hit(b.path)}
          role="button" tabindex="-1"
          onclick={() => onselect(b.path)}
          onkeydown={(e) => e.key === 'Enter' && onselect(b.path)}
        >
          <title>{b.path} — {b.loc} LOC, {b.commits} commits, {b.authors} authors, complexity {b.complexity} · risk rank {b.risk}/100</title>
          <rect x={b.x + 0.5} y={b.y + 0.5} width={Math.max(0, b.w - 1)} height={Math.max(0, b.h - 1)}
                fill={heat(b.risk)} fill-opacity={0.22 + (b.risk / 100) * 0.68}
                stroke={selected === b.path ? '#ffd166' : '#0c0e14'} stroke-width={selected === b.path ? 2 : 0.6} rx="2" />
          {#if b.w > 54 && b.h > 15}
            <text x={b.x + 4} y={b.y + 11} class="flabel">{b.path.split('/').pop()}</text>
          {/if}
        </g>
      {/if}
    {/each}
  </svg>

  <div class="legend">
    <span>low risk</span>
    <i style="background:linear-gradient(90deg,{heat(0)},{heat(45)},{heat(70)},{heat(100)})"></i>
    <span>high</span>
    <em>area = LOC · colour = churn × complexity, ranked within this repo</em>
  </div>
</div>

<style>
  .wrap { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 16px; box-sizing: border-box; }
  svg { flex: 1; min-height: 0; width: 100%; }
  .glabel { fill: #cfd5e4; font: 600 9px ui-sans-serif, system-ui, sans-serif; opacity: .75; }
  .gloc { fill: #cfd5e4; font: 9px ui-monospace, monospace; opacity: .35; }
  .flabel { fill: #0c0e14; font: 600 8px ui-sans-serif, system-ui, sans-serif; pointer-events: none; }
  .file { cursor: pointer; }
  .file:hover rect { stroke: #ffffff88; stroke-width: 1.4; }
  .file.dim { opacity: .12; }
  .legend {
    display: flex; align-items: center; gap: 8px; padding-top: 10px;
    font-size: 10px; color: #8b93a7;
  }
  .legend i { width: 130px; height: 7px; border-radius: 4px; }
  .legend em { margin-left: auto; font-style: normal; opacity: .6; }
</style>