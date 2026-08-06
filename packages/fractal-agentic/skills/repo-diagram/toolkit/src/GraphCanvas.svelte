<script>
  import { SvelteFlow, Background, Controls, MiniMap, BackgroundVariant } from '@xyflow/svelte';
  import BoxNode from './BoxNode.svelte';
  import FitView from './FitView.svelte';

  let { nodes = $bindable(), edges = $bindable(), fitToken, onselect, busy } = $props();
  const nodeTypes = { box: BoxNode };
</script>

{#if busy}<div class="busy">laying out…</div>{/if}
<SvelteFlow
  bind:nodes
  bind:edges
  {nodeTypes}
  fitView
  minZoom={0.03}
  maxZoom={3}
  proOptions={{ hideAttribution: true }}
  onnodeclick={({ node }) => onselect(node.id)}
  onpaneclick={() => onselect(null)}
>
  <FitView token={fitToken} />
  <Background variant={BackgroundVariant.Dots} gap={22} size={1} bgColor="#0c0e14" patternColor="#ffffff10" />
  <Controls />
  <MiniMap pannable zoomable bgColor="#0c0e14" maskColor="#0c0e14cc" nodeColor={(n) => `hsl(${n.data.hue} 55% 45%)`} />
</SvelteFlow>

<style>
  .busy {
    position: absolute; z-index: 10; top: 14px; left: 50%; transform: translateX(-50%);
    background: #1a1e2a; border: 1px solid #ffffff1a; padding: 5px 13px; border-radius: 99px; font-size: 11px;
  }
  :global(.svelte-flow__edge-label) {
    background: #11141c !important; border: 1px solid #ffffff20; color: #cfd5e4;
    font-size: 9px; font-variant-numeric: tabular-nums; padding: 1px 4px; border-radius: 4px;
  }
  :global(.svelte-flow__minimap) { border-radius: 8px; border: 1px solid #ffffff14; }
  :global(.svelte-flow__controls-button) { background: #1a1e2a; border-bottom: 1px solid #ffffff14; fill: #dfe3ec; }
  :global(.svelte-flow__controls-button:hover) { background: #262c3c; }
</style>