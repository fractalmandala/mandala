<script>
  import { Handle, Position } from '@xyflow/svelte';
  let { data, id } = $props();

  const ICON = {
    stylesheet: '{}', entry: '▶', cron: '◷', service: '◆', state: '◈', command: '⌘',
    ipc: '⇄', store: '▤', external: '↗', tool: '⚙', integration: '⧉', model: '✳',
    agent: '◉', function: 'ƒ', shared: '◇', layout: '▢', component: '□', style: '#', layer: '≡'
  };
</script>

<div
  class="box kind-{data.kind}"
  class:collapsed={data.collapsed}
  class:leaf={!data.hasChildren}
  class:lane={data.lane}
  class:dim={data.dim}
  class:match={data.match}
  class:step={data.step > 0}
  style="--hue:{data.hue}"
>
  <Handle type="target" position={Position.Left} />
  <Handle type="source" position={Position.Right} />

  {#if data.step > 0}<span class="stepno">{data.step}</span>{/if}

  <header>
    {#if data.hasChildren}
      <button class="chev" aria-label={data.collapsed ? 'Expand' : 'Collapse'}
              onclick={(e) => { e.stopPropagation(); data.onToggle(id); }}>{data.collapsed ? '▸' : '▾'}</button>
    {:else if ICON[data.kind]}
      <span class="ic">{ICON[data.kind]}</span>
    {:else}
      <span class="dot"></span>
    {/if}
    <span class="label" title={id}>{data.label}</span>
    {#if data.kind === 'stylesheet'}
      <span class="badge">{data.defines?.classes ?? 0}<span class="u">cls</span></span>
    {:else if data.files}
      <span class="badge">{data.files}<span class="u">f</span></span>
    {/if}
  </header>

  {#if data.sub && !data.collapsed}
    <div class="rolled">{data.sub}</div>
  {:else if data.collapsed && data.hiddenCount}
    <div class="rolled">+{data.hiddenCount} nested{#if data.loc} · {(data.loc / 1000).toFixed(1)}k LOC{/if}</div>
  {/if}
</div>

<style>
  .box {
    box-sizing: border-box; width: 100%; height: 100%;
    border-radius: 10px;
    border: 1px solid hsl(var(--hue) 35% 32%);
    background: hsl(var(--hue) 30% 13% / 0.55);
    color: #e8eaf0;
    font: 12px/1.3 ui-sans-serif, system-ui, -apple-system, sans-serif;
    overflow: hidden;
    transition: box-shadow .15s, opacity .15s, border-color .15s;
  }
  .box.leaf {
    background: hsl(var(--hue) 32% 19%);
    border-color: hsl(var(--hue) 38% 40%);
    display: flex; flex-direction: column; justify-content: center;
  }
  .box.kind-package { border-width: 2px; border-color: hsl(var(--hue) 55% 52%); background: hsl(var(--hue) 30% 11% / 0.75); }
  .box.lane { border-style: dashed; border-color: #ffffff2a; background: #ffffff05; }
  .box.kind-stylesheet { background: #2a1f3d; border-color: #c084fc66; border-style: dashed; }
  .box.kind-store { border-radius: 4px; }
  .box.kind-external, .box.kind-tool, .box.kind-integration, .box.kind-model {
    border-style: dotted; background: hsl(var(--hue) 20% 16%);
  }
  .box.kind-entry { border-color: #fbbf2477; }
  .box.dim { opacity: .13; }
  .box.match { box-shadow: 0 0 0 2px #ffd166, 0 0 18px #ffd16655; }
  .box.step { box-shadow: 0 0 0 2px #ffd166, 0 0 22px #ffd16677; border-color: #ffd166; opacity: 1; }
  .stepno {
    position: absolute; top: -8px; left: -8px; z-index: 5;
    width: 17px; height: 17px; border-radius: 50%;
    background: #ffd166; color: #0c0e14;
    font: 700 10px ui-sans-serif, system-ui, sans-serif;
    display: grid; place-items: center;
  }
  header { display: flex; align-items: center; gap: 6px; padding: 7px 9px; font-weight: 550; }
  .kind-package > header { font-size: 13px; color: hsl(var(--hue) 75% 78%); }
  .lane > header { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; opacity: .6; }
  .label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .badge { font-variant-numeric: tabular-nums; font-size: 10px; opacity: .62; background: #ffffff12; padding: 1px 5px; border-radius: 5px; flex: none; }
  .u { opacity: .55; margin-left: 1px; }
  .chev { all: unset; cursor: pointer; width: 14px; text-align: center; opacity: .65; font-size: 10px; border-radius: 3px; flex: none; }
  .chev:hover { opacity: 1; background: #ffffff1a; }
  .ic { font-size: 10px; opacity: .75; width: 12px; text-align: center; flex: none; color: hsl(var(--hue) 70% 72%); }
  .dot { width: 5px; height: 5px; border-radius: 50%; background: hsl(var(--hue) 60% 60%); flex: none; }
  .rolled {
    padding: 0 9px 7px 26px; font-size: 10px; opacity: .5;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  :global(.svelte-flow__handle) { opacity: 0; width: 1px; height: 1px; min-width: 0; min-height: 0; border: 0; }
</style>