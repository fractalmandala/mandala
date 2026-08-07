<script lang="ts">
  import { canvasState } from './CanvasStore.svelte.js';

  let {
    active = false,
    class: className = '',
    children,
    ...rest
  }: {
    active?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();

  let hoveredNodeId = $state<string | null>(null);
  let selectedNodeId = $state<string | null>(null);
  let noteText = $state('');
  let showPopover = $state(false);
  let popoverCoords = $state({ top: 0, left: 0 });
  let highlightRect = $state({ top: 0, left: 0, width: 0, height: 0 });

  function handlePointerMove(e: PointerEvent) {
    if (!active || showPopover) return;

    const target = e.target as HTMLElement;
    const nodeElement = target.closest('[data-node-id]') as HTMLElement | null;

    if (nodeElement) {
      const id = nodeElement.getAttribute('data-node-id');
      if (id) {
        hoveredNodeId = id;
        const rect = nodeElement.getBoundingClientRect();
        const parentRect = nodeElement.offsetParent?.getBoundingClientRect();

        if (parentRect) {
          highlightRect = {
            top: rect.top - parentRect.top,
            left: rect.left - parentRect.left,
            width: rect.width,
            height: rect.height
          };
        } else {
          highlightRect = {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
          };
        }
        return;
      }
    }
    hoveredNodeId = null;
  }

  function handlePointerDown(e: PointerEvent) {
    if (!active || !hoveredNodeId) return;
    e.preventDefault();
    e.stopPropagation();

    selectedNodeId = hoveredNodeId;
    popoverCoords = {
      top: e.clientY + window.scrollY + 10,
      left: e.clientX + window.scrollX
    };
    showPopover = true;
  }

  function saveNote() {
    if (selectedNodeId && noteText.trim()) {
      canvasState.addNodeAnnotation(selectedNodeId, noteText.trim());
      cancelEdit();
    }
  }

  function cancelEdit() {
    noteText = '';
    selectedNodeId = null;
    showPopover = false;
  }
</script>

<div class="inspector-stage-listener {className}" class:inspecting={active} data-inspector-active={active ? 'true' : undefined} onpointermove={handlePointerMove} onpointerdown={handlePointerDown} {...rest}>
  {#if active && hoveredNodeId && !showPopover}
    <div class="node-highlighter-ring" style="top: {highlightRect.top}px; left: {highlightRect.left}px; width: {highlightRect.width}px; height: {highlightRect.height}px">
      <span class="node-tag-badge">{canvasState.getNode(hoveredNodeId)?.tag || 'div'}</span>
    </div>
  {/if}

  {#if showPopover && selectedNodeId}
    <div class="annotation-popover" style="top: {popoverCoords.top}px; left: {popoverCoords.left}px" role="dialog" aria-label="Add UI annotation">
      <div class="popover-meta">
        <code>&lt;{canvasState.getNode(selectedNodeId)?.tag || 'div'}&gt;</code> node annotation
      </div>
      <textarea bind:value={noteText} placeholder="What should Jules do to this element? (e.g. make text bolder)" class="popover-textarea" aria-label="Annotation note" rows="3"></textarea>
      <div class="popover-actions">
        <button class="action-btn cancel" onclick={cancelEdit}>Cancel</button>
        <button class="action-btn save" onclick={saveNote} disabled={!noteText.trim()}>Save</button>
      </div>
    </div>
  {/if}

  {@render children?.()}
</div>

<style lang="sass">
  .inspector-stage-listener
    position: relative
    width: 100%
    height: 100%
    overflow: hidden

    &.inspecting
      cursor: crosshair

  .node-highlighter-ring
    position: absolute
    z-index: 40
    pointer-events: none
    border: 2px dashed hsl(222 47% 11%)
    border-radius: 0.25rem
    background-color: hsl(222 47% 11% / 0.03)
    transition: all 100ms ease

    @media (prefers-color-scheme: dark)
      border-color: hsl(210 40% 98%)
      background-color: hsl(210 40% 98% / 0.03)

  .node-tag-badge
    position: absolute
    top: -1.25rem
    left: 0
    padding: 0.125rem 0.375rem
    border-radius: 0.25rem
    background-color: hsl(222 47% 11%)
    color: hsl(0 0% 100%)
    font-family: ui-monospace
    font-size: 0.6875rem
    line-height: 1rem

    @media (prefers-color-scheme: dark)
      background-color: hsl(210 40% 98%)
      color: hsl(222 47% 11%)

  .annotation-popover
    position: absolute
    z-index: 50
    width: 18rem
    padding: 0.75rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      color: hsl(210 40% 98%)

  .popover-meta
    margin-bottom: 0.5rem
    font-size: 0.75rem
    color: hsl(215 16% 47%)
    code
      background-color: hsl(210 40% 96%)
      padding: 0.125rem 0.25rem
      border-radius: 0.25rem

  .popover-textarea
    display: block
    width: 100%
    min-height: 3.5rem
    padding: 0.5rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    background-color: hsl(0 0% 100%)
    font-size: 0.8125rem
    resize: vertical
    outline: none
    transition: border-color 150ms ease

    &:focus
      border-color: hsl(222 47% 11% / 0.5)
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.5)

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17% / 0.3)
      border-color: hsl(217 33% 17%)
      color: hsl(210 40% 98%)

  .popover-actions
    display: flex
    justify-content: flex-end
    gap: 0.5rem
    margin-top: 0.5rem

  .action-btn
    padding: 0.375rem 0.75rem
    border: 1px solid transparent
    border-radius: 0.375rem
    font-size: 0.8125rem
    font-weight: 500
    cursor: pointer
    transition: background-color 150ms ease, color 150ms ease

    &.cancel
      background-color: transparent
      color: hsl(215 16% 47%)
      &:hover
        background-color: hsl(210 40% 96%)

    &.save
      background-color: hsl(222 47% 11%)
      color: hsl(0 0% 100%)
      &:hover
        background-color: hsl(222 47% 15%)
      &:disabled
        pointer-events: none
        opacity: 0.5

      @media (prefers-color-scheme: dark)
        background-color: hsl(210 40% 98%)
        color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      &.cancel:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
</style>
