<script lang="ts">
  import { canvasState } from './CanvasStore.svelte.js';

  let {
    class: className = '',
    ...rest
  }: {
    class?: string;
    [key: string]: unknown;
  } = $props();

  let isCompiling = $state(false);

  function focusNode(nodeId: string) {
    canvasState.selectedNodeId = nodeId;
    const element = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('flash-highlight');
      setTimeout(() => element.classList.remove('flash-highlight'), 1500);
    }
  }

  function removeAnnotation(nodeId: string, annotationId: string) {
    canvasState.removeNodeAnnotation(nodeId, annotationId);
  }

  function handleCompileAll() {
    isCompiling = true;
    setTimeout(() => {
      canvasState.solveAllAnnotations();
      isCompiling = false;
    }, 2000);
  }
</script>

<div class="annotation-panel {className}" {...rest}>
  <header class="panel-header">
    <span class="title">Active Annotations ({canvasState.totalAnnotations})</span>
    {#if canvasState.totalAnnotations > 0}
      <button class="compile-btn" onclick={handleCompileAll} disabled={isCompiling}>
        {isCompiling ? 'Compiling...' : 'Compile All'}
      </button>
    {/if}
  </header>

  <div class="annotations-list">
    {#if canvasState.totalAnnotations === 0}
      <div class="empty-state">
        <span class="icon" aria-hidden="true">💡</span>
        <p class="muted-text">Press the Inspector button and click elements to drop AI notes.</p>
      </div>
    {:else}
      {#each Object.values(canvasState.nodes) as node}
        {#if node.annotations && node.annotations.length > 0}
          {#each node.annotations as note}
            <div class="annotation-item-card" class:solved={note.status === 'resolved'}>
              <div class="card-header">
                <span class="tag-badge"><code>&lt;{node.tag}&gt;</code></span>
                <span class="status-tag" class:resolved={note.status === 'resolved'}>
                  {note.status}
                </span>
              </div>
              <p class="card-prompt">{note.prompt}</p>
              <div class="card-footer">
                <button class="footer-btn focus-btn" onclick={() => focusNode(node.id)} aria-label="Focus element on canvas">
                  Focus Element
                </button>
                <button class="footer-btn delete-btn" onclick={() => removeAnnotation(node.id, note.id)} aria-label="Delete annotation">
                  Delete
                </button>
              </div>
            </div>
          {/each}
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style lang="sass">
  .annotation-panel
    display: flex
    flex-direction: column
    height: 100%
    overflow: hidden

  .panel-header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 0.75rem
    border-bottom: 1px solid hsl(214 32% 91%)

    @media (prefers-color-scheme: dark)
      border-bottom-color: hsl(217 33% 17%)

  .title
    font-size: 0.8125rem
    font-weight: 600
    color: hsl(222 47% 11%)
    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .compile-btn
    padding: 0.25rem 0.5rem
    border: 1px solid hsl(222 47% 11% / 0.2)
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(222 47% 11%)
    font-size: 0.75rem
    font-weight: 500
    cursor: pointer
    transition: background-color 150ms ease
    &:hover
      background-color: hsl(210 40% 96%)
    &:disabled
      pointer-events: none
      opacity: 0.5
    @media (prefers-color-scheme: dark)
      border-color: hsl(210 40% 98% / 0.2)
      color: hsl(210 40% 98%)
      &:hover
        background-color: hsl(217 33% 17%)

  .annotations-list
    flex: 1 1 auto
    overflow-y: auto
    padding: 0.75rem
    display: flex
    flex-direction: column
    gap: 0.5rem

  .empty-state
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    gap: 0.5rem
    padding: 2rem 1rem
    text-align: center

  .muted-text
    margin: 0
    font-size: 0.8125rem
    color: hsl(215 16% 47%)
    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)

  .annotation-item-card
    display: flex
    flex-direction: column
    gap: 0.375rem
    padding: 0.625rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    transition: opacity 200ms ease

    &.solved
      opacity: 0.6

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)

  .card-header
    display: flex
    align-items: center
    justify-content: space-between

  .tag-badge
    font-size: 0.6875rem
    code
      padding: 0.125rem 0.25rem
      background-color: hsl(210 40% 96%)
      border-radius: 0.25rem
    @media (prefers-color-scheme: dark)
      code
        background-color: hsl(217 33% 17%)

  .status-tag
    font-size: 0.625rem
    font-weight: 500
    text-transform: uppercase
    padding: 0.125rem 0.375rem
    border-radius: 9999px
    background-color: hsl(38 92% 50% / 0.1)
    color: hsl(38 92% 50%)
    &.resolved
      background-color: hsl(142 71% 45% / 0.1)
      color: hsl(142 71% 45%)

  .card-prompt
    margin: 0
    font-size: 0.8125rem
    color: hsl(222 47% 11%)
    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .card-footer
    display: flex
    gap: 0.5rem

  .footer-btn
    padding: 0.25rem 0.5rem
    border: 0
    border-radius: 0.25rem
    font-size: 0.6875rem
    font-weight: 500
    cursor: pointer
    transition: background-color 150ms ease

    &.focus-btn
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)
      &:hover
        background-color: hsl(214 32% 91%)
      @media (prefers-color-scheme: dark)
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
        &:hover
          background-color: hsl(217 33% 22%)

    &.delete-btn
      background-color: hsl(0 84% 60% / 0.1)
      color: hsl(0 84% 60%)
      &:hover
        background-color: hsl(0 84% 60% / 0.2)
      @media (prefers-color-scheme: dark)
        background-color: hsl(0 84% 60% / 0.15)
</style>
