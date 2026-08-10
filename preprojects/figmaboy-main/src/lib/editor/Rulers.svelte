<script lang="ts">
  import { onMount } from "svelte";
  import type { EditorSession } from "$lib/editor/editor.svelte";

  let { session }: { session: EditorSession } = $props();
  let rulerH = $state<HTMLCanvasElement>();
  let rulerV = $state<HTMLCanvasElement>();
  let container = $state<HTMLDivElement>();
  let mounted = $state(false);

  const RULER_SIZE = 20;

  function drawRulers() {
    if (!mounted || !rulerH || !rulerV || !container) return;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const dpr = window.devicePixelRatio || 1;

    // Horizontal ruler
    if (rulerH.width !== width * dpr || rulerH.height !== RULER_SIZE * dpr) {
      rulerH.width = width * dpr;
      rulerH.height = RULER_SIZE * dpr;
      rulerH.style.width = `${width}px`;
      rulerH.style.height = `${RULER_SIZE}px`;
    }

    // Vertical ruler
    if (rulerV.width !== RULER_SIZE * dpr || rulerV.height !== height * dpr) {
      rulerV.width = RULER_SIZE * dpr;
      rulerV.height = height * dpr;
      rulerV.style.width = `${RULER_SIZE}px`;
      rulerV.style.height = `${height}px`;
    }

    const ctxH = rulerH.getContext("2d");
    const ctxV = rulerV.getContext("2d");
    if (!ctxH || !ctxV) return;

    const zoom = session.document.viewport.zoom;
    const panX = session.document.viewport.x;
    const panY = session.document.viewport.y;

    // Find best interval for tick marks
    const targetSpacing = 60;
    const INTERVALS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
    let interval = 100;
    for (const inv of INTERVALS) {
      if (inv * zoom >= targetSpacing) { interval = inv; break; }
    }

    let subdivisions = 10;
    if (interval === 5 || interval === 50 || interval === 500 || interval === 5000) subdivisions = 5;
    else if (interval === 2 || interval === 20 || interval === 200 || interval === 2000) subdivisions = 4;

    const subStep = interval / subdivisions;

    // Draw horizontal ruler
    ctxH.save();
    ctxH.scale(dpr, dpr);
    ctxH.clearRect(0, 0, width, RULER_SIZE);
    ctxH.fillStyle = "#2a2a2a";
    ctxH.fillRect(0, 0, width, RULER_SIZE);

    ctxH.strokeStyle = "#555";
    ctxH.lineWidth = 1;
    ctxH.fillStyle = "#aaa";
    ctxH.font = "9px -apple-system, BlinkMacSystemFont, sans-serif";

    const hStart = -panX / zoom;
    const hEnd = (width - panX) / zoom;
    const hStartTick = Math.ceil(hStart / subStep) * subStep;

    for (let val = hStartTick; val <= hEnd; val += subStep) {
      const isMajor = Math.abs(val % interval) < subStep / 2 || Math.abs((val % interval) - interval) < subStep / 2;
      const screenX = val * zoom + panX;

      ctxH.beginPath();
      if (isMajor) {
        ctxH.moveTo(screenX, RULER_SIZE * 0.55);
        ctxH.lineTo(screenX, RULER_SIZE);
        ctxH.stroke();
        ctxH.textAlign = "center";
        ctxH.textBaseline = "top";
        ctxH.fillText(Math.round(val).toString(), screenX, 2);
      } else {
        ctxH.moveTo(screenX, RULER_SIZE * 0.75);
        ctxH.lineTo(screenX, RULER_SIZE);
        ctxH.stroke();
      }
    }

    // Draw vertical guide markers on horizontal ruler
    for (const guide of session.userGuides) {
      if (guide.type === "v") {
        const screenX = guide.value * zoom + panX;
        if (screenX >= 0 && screenX <= width) {
          const isDragging = session.rulerDrag?.id === guide.id;
          ctxH.fillStyle = isDragging ? "#0d99ff" : "#ff6b35";
          ctxH.strokeStyle = isDragging ? "#0d99ff" : "#ff6b35";
          ctxH.lineWidth = 1.5;
          ctxH.beginPath();
          ctxH.moveTo(screenX, RULER_SIZE * 0.5);
          ctxH.lineTo(screenX, RULER_SIZE);
          ctxH.stroke();
          ctxH.font = "bold 9px -apple-system, BlinkMacSystemFont, sans-serif";
          ctxH.textAlign = "center";
          ctxH.textBaseline = "top";
          ctxH.fillText(Math.round(guide.value).toString(), screenX, 1);
        }
      }
    }
    ctxH.restore();

    // Draw vertical ruler
    ctxV.save();
    ctxV.scale(dpr, dpr);
    ctxV.clearRect(0, 0, RULER_SIZE, height);
    ctxV.fillStyle = "#2a2a2a";
    ctxV.fillRect(0, 0, RULER_SIZE, height);

    ctxV.strokeStyle = "#555";
    ctxV.lineWidth = 1;
    ctxV.fillStyle = "#aaa";
    ctxV.font = "9px -apple-system, BlinkMacSystemFont, sans-serif";

    const vStart = -panY / zoom;
    const vEnd = (height - panY) / zoom;
    const vStartTick = Math.ceil(vStart / subStep) * subStep;

    for (let val = vStartTick; val <= vEnd; val += subStep) {
      const isMajor = Math.abs(val % interval) < subStep / 2 || Math.abs((val % interval) - interval) < subStep / 2;
      const screenY = val * zoom + panY;

      ctxV.beginPath();
      if (isMajor) {
        ctxV.moveTo(RULER_SIZE * 0.55, screenY);
        ctxV.lineTo(RULER_SIZE, screenY);
        ctxV.stroke();
        ctxV.save();
        ctxV.translate(6, screenY);
        ctxV.rotate(-Math.PI / 2);
        ctxV.textAlign = "center";
        ctxV.textBaseline = "middle";
        ctxV.fillText(Math.round(val).toString(), 0, 0);
        ctxV.restore();
      } else {
        ctxV.moveTo(RULER_SIZE * 0.75, screenY);
        ctxV.lineTo(RULER_SIZE, screenY);
        ctxV.stroke();
      }
    }

    // Draw horizontal guide markers on vertical ruler
    for (const guide of session.userGuides) {
      if (guide.type === "h") {
        const screenY = guide.value * zoom + panY;
        if (screenY >= 0 && screenY <= height) {
          const isDragging = session.rulerDrag?.id === guide.id;
          ctxV.fillStyle = isDragging ? "#0d99ff" : "#ff6b35";
          ctxV.strokeStyle = isDragging ? "#0d99ff" : "#ff6b35";
          ctxV.lineWidth = 1.5;
          ctxV.beginPath();
          ctxV.moveTo(RULER_SIZE * 0.5, screenY);
          ctxV.lineTo(RULER_SIZE, screenY);
          ctxV.stroke();
          ctxV.save();
          ctxV.translate(10, screenY);
          ctxV.rotate(-Math.PI / 2);
          ctxV.font = "bold 9px -apple-system, BlinkMacSystemFont, sans-serif";
          ctxV.textAlign = "center";
          ctxV.textBaseline = "bottom";
          ctxV.fillText(Math.round(guide.value).toString(), 0, 0);
          ctxV.restore();
        }
      }
    }
    ctxV.restore();
  }

  onMount(() => {
    mounted = true;
    drawRulers();

    const resizeObserver = new ResizeObserver(() => drawRulers());
    resizeObserver.observe(container!);

    return () => {
      resizeObserver.disconnect();
    };
  });

  // Reactive effect to redraw when viewport or guides change
  $effect(() => {
    const _ = [
      session.document.viewport.x,
      session.document.viewport.y,
      session.document.viewport.zoom,
      session.userGuides.length,
      ...session.userGuides.map((g) => g.value),
      session.rulerDrag?.id,
    ];
    drawRulers();
  });

  function rulerPointerDown(event: PointerEvent, type: "h" | "v") {
    event.stopPropagation();
    const rect = container!.getBoundingClientRect();
    const zoom = session.document.viewport.zoom;
    const panX = session.document.viewport.x;
    const panY = session.document.viewport.y;

    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const worldX = (screenX - panX) / zoom;
    const worldY = (screenY - panY) / zoom;
    const val = type === "h" ? worldY : worldX;

    const id = session.addGuide(type, val);
    session.rulerDrag = { id, type, isNew: true };

    const move = (e: PointerEvent) => {
      const mRect = container!.getBoundingClientRect();
      const mX = e.clientX - mRect.left;
      const mY = e.clientY - mRect.top;
      const mWorldX = (mX - session.document.viewport.x) / session.document.viewport.zoom;
      const mWorldY = (mY - session.document.viewport.y) / session.document.viewport.zoom;
      const mVal = type === "h" ? mWorldY : mWorldX;
      session.updateGuide(id, Math.round(mVal));
    };

    const up = (e: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const uRect = container!.getBoundingClientRect();
      const isOverRuler = type === "h"
        ? Math.abs(e.clientY - uRect.top) < RULER_SIZE
        : Math.abs(e.clientX - uRect.left) < RULER_SIZE;
      if (isOverRuler && !session.rulerDrag) {
        // Already handled by rulerDrag check
      }
      // Check if dragged back to ruler area to delete
      const canvasRect = container!.getBoundingClientRect();
      if (type === "h" && (e.clientY < canvasRect.top + RULER_SIZE || e.clientY > canvasRect.bottom - RULER_SIZE)) {
        // Don't delete - keep the guide
      }
      session.clearRulerDrag();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
</script>

<div class="rulers-container" bind:this={container}>
  <div class="ruler-corner"></div>
  <canvas
    bind:this={rulerH}
    class="ruler-h"
    onpointerdown={(e) => rulerPointerDown(e, "h")}
  ></canvas>
  <canvas
    bind:this={rulerV}
    class="ruler-v"
    onpointerdown={(e) => rulerPointerDown(e, "v")}
  ></canvas>
</div>

<style>
  .rulers-container { position: absolute; inset: 0; pointer-events: none; z-index: 50; }
  .ruler-corner { position: absolute; left: 0; top: 0; width: 20px; height: 20px; background: #2a2a2a; z-index: 51; border-right: 1px solid #444; border-bottom: 1px solid #444; }
  .ruler-h { position: absolute; left: 20px; top: 0; height: 20px; pointer-events: all; cursor: crosshair; }
  .ruler-v { position: absolute; left: 0; top: 20px; width: 20px; pointer-events: all; cursor: crosshair; }
</style>
