<script lang="ts">
  import { canvasState } from './CanvasStore.svelte.js';

  const tags = [
    'div', 'section', 'article', 'header', 'nav', 'main',
    'footer', 'aside', 'ul', 'ol', 'li', 'figure', 'figcaption'
  ];

  let {
    class: className = '',
    ...rest
  }: {
    class?: string;
    [key: string]: unknown;
  } = $props();

  let showDropdown = $state(false);

  let selectedTag = $derived(
    canvasState.selectedNodeId
      ? canvasState.nodes[canvasState.selectedNodeId]?.tag ?? 'div'
      : 'div'
  );

  function changeTag(tag: string) {
    if (canvasState.selectedNodeId) {
      canvasState.updateNodeTag(canvasState.selectedNodeId, tag);
    }
    showDropdown = false;
  }
</script>

<div class="tag-selector-field {className}" {...rest}>
  <label for="tag-trigger-select" class="tag-label">Semantic Element Wrapper</label>

  <button
    id="tag-trigger-select"
    class="tag-trigger"
    class:active={showDropdown}
    onclick={() => showDropdown = !showDropdown}
    aria-haspopup="listbox"
    aria-expanded={showDropdown}
  >
    <span>{selectedTag}</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </button>

  {#if showDropdown}
    <div class="tag-dropdown" role="listbox" aria-label="Select tag">
      {#each tags as tag}
        <button
          class="tag-option"
          class:tag-option--selected={tag === selectedTag}
          type="button"
          role="option"
          aria-selected={tag === selectedTag}
          onclick={() => changeTag(tag)}
        >
          {tag}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style lang="sass">
  .tag-selector-field
    display: flex
    flex-direction: column
    gap: 0.375rem
    position: relative

  .tag-label
    font-size: 0.75rem
    font-weight: 500
    color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)

  .tag-trigger
    display: flex
    align-items: center
    justify-content: space-between
    width: 100%
    padding: 0.5rem 0.625rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(222 47% 11%)
    font-size: 0.8125rem
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    cursor: pointer
    transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover, &.active
      border-color: hsl(222 47% 11% / 0.5)
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.5)

    > svg
      width: 0.875rem
      height: 0.875rem
      color: hsl(215 16% 47%)
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &.active > svg
      transform: rotate(180deg)

    @media (prefers-color-scheme: dark)
      border-color: hsl(217 33% 22%)
      color: hsl(210 40% 98%)

  .tag-dropdown
    position: absolute
    top: 100%
    left: 0
    right: 0
    z-index: 20
    margin-top: 0.25rem
    padding: 0.25rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    background-color: hsl(0 0% 100%)
    box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
    max-height: 12rem
    overflow-y: auto

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      color: hsl(210 40% 98%)

  .tag-option
    display: block
    width: 100%
    padding: 0.375rem 0.5rem
    border: 0
    border-radius: 0.25rem
    background: transparent
    color: hsl(222 47% 11%)
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    font-size: 0.8125rem
    cursor: pointer
    text-align: left
    transition: background-color 100ms ease

    &:hover
      background-color: hsl(210 40% 96%)

    &--selected
      background-color: hsl(210 40% 96%)
      font-weight: 600

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
      &:hover, &--selected
        background-color: hsl(217 33% 22%)
</style>
