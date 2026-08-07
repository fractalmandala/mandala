<script lang="ts">
  let {
    collapsed = true,
    class: className = '',
    children,
    ...rest
  }: {
    collapsed?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();

  const initialExpanded = !collapsed;
  let isExpanded = $state(initialExpanded);
</script>

<div class="code-overflow {className}" data-collapsed={!isExpanded} {...rest}>
  <div class="code-overflow-content">
    {@render children?.()}
  </div>
  {#if !isExpanded}
    <div class="code-overflow-fade">
      <button class="code-overflow-expand" type="button" onclick={() => isExpanded = true}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        Expand
      </button>
    </div>
  {/if}
</div>

<style lang="sass">
  .code-overflow
    position: relative
    max-height: 650px
    overflow: hidden

    &[data-collapsed="true"]
      max-height: 300px

  .code-overflow-content
    overflow-x: auto

    &::-webkit-scrollbar
      height: 6px

    &::-webkit-scrollbar-thumb
      background-color: hsl(214 32% 91%)
      border-radius: 9999px

  .code-overflow-fade
    position: absolute
    bottom: 0
    left: 0
    right: 0
    height: 4rem
    background: linear-gradient(to top, hsl(0 0% 100%), transparent)
    display: flex
    align-items: flex-end
    justify-content: center
    padding-bottom: 0.5rem

    @media (prefers-color-scheme: dark)
      background: linear-gradient(to top, hsl(222 47% 6%), transparent)

  .code-overflow-expand
    display: inline-flex
    align-items: center
    gap: 0.375rem
    padding: 0.25rem 0.75rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    background-color: hsl(0 0% 100%)
    color: hsl(215 16% 47%)
    font-size: 0.75rem
    font-weight: 500
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    > svg
      width: 1rem
      height: 1rem
      flex-shrink: 0

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      &:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
</style>
