<script lang="ts">
  import { canvasState } from './CanvasStore.svelte.js';

  let {
    class: className = '',
    ...rest
  }: {
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="left-sidebar {className}" data-collapsed={canvasState.isLeftSidebarCollapsed ? 'true' : undefined} {...rest}>
  {#if !canvasState.isLeftSidebarCollapsed}
    <div class="sidebar-tabs">
      <button
        class="sidebar-tab"
        class:active={canvasState.activeLeftTab === 'layers'}
        onclick={() => canvasState.activeLeftTab = 'layers'}
      >
        Layers
      </button>
      <button
        class="sidebar-tab"
        class:active={canvasState.activeLeftTab === 'components'}
        onclick={() => canvasState.activeLeftTab = 'components'}
      >
        Components
      </button>
    </div>

    <div class="sidebar-panel">
      {#if canvasState.activeLeftTab === 'layers'}
        <div class="layers-panel">
          <div class="layers-list">
            {#each Object.entries(canvasState.nodes) as [id, node]}
              <button
                class="layer-item"
                class:layer-item--selected={canvasState.selectedNodeId === id}
                onclick={() => canvasState.selectNode(id)}
                type="button"
              >
                <span class="layer-tag">&lt;{node.tag}&gt;</span>
                {#if node.content}
                  <span class="layer-preview">{node.content}</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {:else if canvasState.activeLeftTab === 'components'}
        <div class="components-panel">
          <div class="component-grid">
            {#each ['📢 Hero', '💳 Pricing', '⭐ Features', '🔗 Footer', '🧭 Nav', '💬 Testimonial', '🚀 CTA', '📊 Stats', '🖼️ Gallery'] as comp}
              <button class="component-pill" type="button">
                {comp}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <div class="sidebar-footer">
    <button class="collapse-btn" onclick={() => canvasState.toggleLeftSidebar()} aria-label="Toggle sidebar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {#if canvasState.isLeftSidebarCollapsed}
          <path d="m9 18 6-6-6-6"/>
        {:else}
          <path d="m15 18-6-6 6-6"/>
        {/if}
      </svg>
    </button>
  </div>
</div>

<style lang="sass">
  .left-sidebar
    display: flex
    flex-direction: column
    height: 100%
    width: 260px
    background-color: hsl(0 0% 100%)
    border-right: 1px solid hsl(214 32% 91%)
    transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1)

    &[data-collapsed="true"]
      width: 48px

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-right-color: hsl(217 33% 17%)

  .sidebar-tabs
    display: flex
    gap: 0
    border-bottom: 1px solid hsl(214 32% 91%)
    @media (prefers-color-scheme: dark)
      border-bottom-color: hsl(217 33% 17%)

  .sidebar-tab
    flex: 1
    padding: 0.5rem
    border: 0
    background: transparent
    color: hsl(215 16% 47%)
    font-size: 0.75rem
    font-weight: 500
    cursor: pointer
    transition: color 150ms ease, background-color 150ms ease
    border-bottom: 2px solid transparent

    &.active
      color: hsl(222 47% 11%)
      border-bottom-color: hsl(222 47% 11%)

    &:hover:not(.active)
      background-color: hsl(210 40% 96%)

    @media (prefers-color-scheme: dark)
      &.active
        color: hsl(210 40% 98%)
        border-bottom-color: hsl(210 40% 98%)
      &:hover:not(.active)
        background-color: hsl(217 33% 17%)

  .sidebar-panel
    flex: 1
    overflow-y: auto

  .layers-panel
    padding: 0.5rem

  .layers-list
    display: flex
    flex-direction: column
    gap: 0.125rem

  .layer-item
    display: flex
    align-items: center
    gap: 0.5rem
    width: 100%
    padding: 0.375rem 0.5rem
    border: 0
    border-radius: 0.375rem
    background: transparent
    cursor: pointer
    text-align: left
    transition: background-color 100ms ease

    &:hover
      background-color: hsl(210 40% 96%)

    &--selected
      background-color: hsl(210 40% 96%)
      font-weight: 600

    @media (prefers-color-scheme: dark)
      &:hover, &--selected
        background-color: hsl(217 33% 17%)

  .layer-tag
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    font-size: 0.75rem
    color: hsl(215 16% 47%)

  .layer-preview
    font-size: 0.6875rem
    color: hsl(215 16% 47%)
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap

  .components-panel
    padding: 0.5rem

  .component-grid
    display: flex
    flex-direction: column
    gap: 0.25rem

  .component-pill
    padding: 0.5rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    background: transparent
    color: hsl(222 47% 11%)
    font-size: 0.75rem
    text-align: left
    cursor: pointer
    transition: background-color 150ms ease, border-color 150ms ease
    &:hover
      background-color: hsl(210 40% 96%)
      border-color: hsl(222 47% 11% / 0.3)
    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
      border-color: hsl(217 33% 22%)
      &:hover
        background-color: hsl(217 33% 17%)
        border-color: hsl(217 33% 22%)

  .sidebar-footer
    padding: 0.5rem
    border-top: 1px solid hsl(214 32% 91%)
    display: flex
    justify-content: flex-end
    @media (prefers-color-scheme: dark)
      border-top-color: hsl(217 33% 17%)

  .collapse-btn
    display: inline-flex
    align-items: center
    justify-content: center
    width: 2rem
    height: 2rem
    border: 0
    border-radius: 0.375rem
    background: transparent
    color: hsl(215 16% 47%)
    cursor: pointer
    transition: background-color 150ms ease
    &:hover
      background-color: hsl(210 40% 96%)
    > svg
      width: 1rem
      height: 1rem
    @media (prefers-color-scheme: dark)
      &:hover
        background-color: hsl(217 33% 17%)
</style>
