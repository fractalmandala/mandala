<script lang="ts">
  let {
    items = [],
    class: className = '',
    ...rest
  }: {
    items?: Array<{
      id: string | number;
      name: string;
      type: 'folder' | 'file';
      isOpen?: boolean;
      children?: Array<{ id: string | number; name: string; type: 'folder' | 'file' }>;
    }>;
    class?: string;
    [key: string]: unknown;
  } = $props();

  let openFolders = $state<Set<string | number>>(new Set());

  function toggleFolder(id: string | number) {
    if (openFolders.has(id)) {
      openFolders.delete(id);
    } else {
      openFolders.add(id);
    }
    openFolders = new Set(openFolders);
  }
</script>

<div class="tree-view {className}" {...rest}>
  {#each items as item}
    <div class="tree-node">
      <button
        class="tree-node__row"
        type="button"
        onclick={() => item.type === 'folder' ? toggleFolder(item.id) : undefined}
      >
        {#if item.type === 'folder'}
          <svg class="tree-node__chevron" class:tree-node__chevron--open={openFolders.has(item.id)} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          <svg class="tree-node__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
        {:else}
          <svg class="tree-node__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
        {/if}
        <span class="tree-node__label">{item.name}</span>
      </button>
      {#if item.type === 'folder' && item.children && openFolders.has(item.id)}
        <div class="tree-node__children">
          {#each item.children as child}
            <div class="tree-node tree-node--child">
              <button class="tree-node__row" type="button">
                {#if child.type === 'folder'}
                  <svg class="tree-node__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
                {:else}
                  <svg class="tree-node__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                {/if}
                <span class="tree-node__label">{child.name}</span>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style lang="sass">
  .tree-view
    display: flex
    flex-direction: column
    gap: 0.125rem
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    font-size: 0.8125rem

  .tree-node__row
    display: flex
    align-items: center
    gap: 0.375rem
    width: 100%
    padding: 0.25rem 0.5rem
    border: 0
    border-radius: 0.375rem
    background-color: transparent
    color: inherit
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)

    @media (prefers-color-scheme: dark)
      &:hover
        background-color: hsl(217 33% 17%)

  .tree-node__chevron
    width: 0.875rem
    height: 0.875rem
    color: hsl(215 16% 47%)
    flex-shrink: 0
    transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &--open
      transform: rotate(90deg)

  .tree-node__icon
    width: 0.875rem
    height: 0.875rem
    color: hsl(215 16% 47%)
    flex-shrink: 0

  .tree-node__label
    flex: 1 1 auto
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap

  .tree-node__children
    display: flex
    flex-direction: column
    padding-left: 1rem
</style>
