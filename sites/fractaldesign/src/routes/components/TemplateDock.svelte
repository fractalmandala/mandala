<script lang="ts">
  import { canvasState } from './CanvasStore.svelte.js';

  let showTemplates = $state(false);

  const templatesList = [
    {
      id: 'hero_headline',
      name: 'Hero Section',
      description: 'Minimalist centering layout for title cards',
      icon: '📢',
      nodes: [
        { id: 'h1', tag: 'header', class: 'hero-layout', children: ['h2', 'h3'] },
        { id: 'h2', tag: 'h1', content: 'Create websites with AI agency blocks' },
        { id: 'h3', tag: 'p', content: 'Decompile designs, edit properties, compile to native code.' }
      ]
    },
    {
      id: 'pricing_grids',
      name: '3-Column Pricing',
      description: 'Stacked features table list with cards',
      icon: '💳',
      nodes: [
        { id: 'p1', tag: 'section', class: 'pricing-section', children: ['pc1', 'pc2'] },
        { id: 'pc1', tag: 'div', class: 'price-card', children: ['ph1', 'ph2'] },
        { id: 'ph1', tag: 'h3', content: 'Starter Pack ($9)' },
        { id: 'ph2', tag: 'p', content: 'Perfect for side projects' },
        { id: 'pc2', tag: 'div', class: 'price-card basic-highlight', children: ['ph3', 'ph4'] },
        { id: 'ph3', tag: 'h3', content: 'Pro Pack ($29)' },
        { id: 'ph4', tag: 'p', content: 'For growing teams' }
      ]
    }
  ];

  let {
    class: className = '',
    ...rest
  }: {
    class?: string;
    [key: string]: unknown;
  } = $props();

  function loadLayout(templateNodes: any[]) {
    canvasState.insertLayoutTemplate(templateNodes);
    showTemplates = false;
  }
</script>

<div class="template-dock-container {className}" {...rest}>
  <button
    class="dock-launcher"
    class:active={showTemplates}
    aria-haspopup="dialog"
    aria-expanded={showTemplates}
    aria-controls="templates-dialog"
    onclick={() => showTemplates = !showTemplates}
  >
    <span class="launcher-icon" aria-hidden="true">🧱</span>
    <span class="launcher-label">Layout Templates</span>
  </button>

  {#if showTemplates}
    <div id="templates-dialog" class="templates-overlay" role="dialog" aria-modal="false" aria-label="Section Layout Templates">
      <div class="overlay-header">
        <span class="overlay-title">Templates</span>
        <button class="overlay-close" onclick={() => showTemplates = false} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="templates-list">
        {#each templatesList as template}
          <button class="template-card" type="button" onclick={() => loadLayout(template.nodes)}>
            <span class="template-icon">{template.icon}</span>
            <div class="template-info">
              <span class="template-name">{template.name}</span>
              <span class="template-desc">{template.description}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="sass">
  .template-dock-container
    position: relative

  .dock-launcher
    display: inline-flex
    align-items: center
    gap: 0.375rem
    padding: 0.5rem 0.75rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    font-size: 0.8125rem
    font-weight: 500
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover, &.active
      background-color: hsl(210 40% 96%)
      border-color: hsl(222 47% 11% / 0.3)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 22%)
      color: hsl(210 40% 98%)
      &:hover, &.active
        background-color: hsl(217 33% 17%)
        border-color: hsl(217 33% 22%)

  .templates-overlay
    position: absolute
    bottom: calc(100% + 0.5rem)
    left: 0
    z-index: 50
    width: 18rem
    max-height: 20rem
    overflow-y: auto
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)

  .overlay-header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 0.625rem 0.75rem
    border-bottom: 1px solid hsl(214 32% 91%)
    position: sticky
    top: 0
    background-color: hsl(0 0% 100%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-bottom-color: hsl(217 33% 17%)

  .overlay-title
    font-size: 0.75rem
    font-weight: 600
    text-transform: uppercase
    letter-spacing: 0.05em
    color: hsl(215 16% 47%)

  .overlay-close
    display: inline-flex
    align-items: center
    justify-content: center
    width: 1.5rem
    height: 1.5rem
    padding: 0
    border: 0
    border-radius: 0.25rem
    background: transparent
    color: hsl(215 16% 47%)
    cursor: pointer
    &:hover
      background-color: hsl(210 40% 96%)
    > svg
      width: 0.875rem
      height: 0.875rem

  .templates-list
    display: flex
    flex-direction: column
    gap: 0.125rem
    padding: 0.5rem

  .template-card
    display: flex
    align-items: center
    gap: 0.5rem
    padding: 0.5rem
    border: 0
    border-radius: 0.375rem
    background: transparent
    cursor: pointer
    text-align: left
    transition: background-color 100ms ease

    &:hover
      background-color: hsl(210 40% 96%)

    @media (prefers-color-scheme: dark)
      &:hover
        background-color: hsl(217 33% 17%)

  .template-icon
    display: flex
    align-items: center
    justify-content: center
    width: 2rem
    height: 2rem
    border-radius: 0.375rem
    background-color: hsl(210 40% 96%)
    font-size: 1rem
    flex-shrink: 0

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)

  .template-info
    display: flex
    flex-direction: column
    min-width: 0

  .template-name
    font-size: 0.8125rem
    font-weight: 600
    color: hsl(222 47% 11%)
    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .template-desc
    font-size: 0.6875rem
    color: hsl(215 16% 47%)
    white-space: nowrap
    text-overflow: ellipsis
    overflow: hidden
    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
</style>
