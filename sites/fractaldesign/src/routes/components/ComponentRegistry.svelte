<script lang="ts">
  const components = [
    { id: 'hero', name: 'Hero Section', description: 'Centered title card layout', icon: '📢' },
    { id: 'pricing', name: '3-Col Pricing', description: 'Pricing cards', icon: '💳' },
    { id: 'features', name: 'Features', description: 'Grid of feature cards', icon: '⭐' },
    { id: 'footer', name: 'Footer', description: 'Site footer layout', icon: '🔗' },
    { id: 'nav', name: 'Navigation', description: 'Nav bar layout', icon: '🧭' },
    { id: 'testimonial', name: 'Testimonial', description: 'Quote card', icon: '💬' },
    { id: 'cta', name: 'CTA Section', description: 'Call to action banner', icon: '🚀' },
    { id: 'stats', name: 'Stats Bar', description: 'Number counters row', icon: '📊' },
    { id: 'gallery', name: 'Gallery Grid', description: 'Image grid layout', icon: '🖼️' },
  ];

  let {
    class: className = '',
    ...rest
  }: {
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="component-registry {className}" {...rest}>
  <div class="component-grid">
    {#each components as comp}
      <button class="component-card" type="button" draggable="true" data-component-id={comp.id}>
        <div class="card-icon">{comp.icon}</div>
        <div class="card-info">
          <span class="card-name">{comp.name}</span>
          <span class="card-desc">{comp.description}</span>
        </div>
      </button>
    {/each}
  </div>
</div>

<style lang="sass">
  .component-registry
    padding: 0.75rem

  .component-grid
    display: grid
    grid-template-columns: 1fr
    gap: 0.375rem

  .component-card
    display: flex
    align-items: center
    gap: 0.625rem
    width: 100%
    padding: 0.5rem
    border: 1px solid transparent
    border-radius: 0.5rem
    background-color: transparent
    cursor: grab
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)
    text-align: left

    &:hover
      background-color: hsl(210 40% 96%)
      border-color: hsl(214 32% 91%)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px

    @media (prefers-color-scheme: dark)
      &:hover
        background-color: hsl(217 33% 17%)
        border-color: hsl(217 33% 22%)

  .card-icon
    display: flex
    align-items: center
    justify-content: center
    width: 2.25rem
    height: 2.25rem
    border-radius: 0.5rem
    background-color: hsl(210 40% 96%)
    font-size: 1.125rem
    flex-shrink: 0

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)

  .card-info
    display: flex
    flex-direction: column
    min-width: 0

  .card-name
    font-size: 0.8125rem
    font-weight: 600
    color: hsl(222 47% 11%)
    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .card-desc
    font-size: 0.6875rem
    color: hsl(215 16% 47%)
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
</style>
