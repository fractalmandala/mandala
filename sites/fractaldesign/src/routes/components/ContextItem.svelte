<script lang="ts">
  let {
    name = '',
    count = 0,
    class: className = '',
    children,
    ...rest
  }: {
    name?: string;
    count?: number;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="context-item {className}" {...rest}>
  <span class="context-item-name">{name}</span>
  <span class="context-item-count">{count}</span>
  {@render children?.()}
</div>

<style lang="sass">
  .context-item
    display: flex
    align-items: center
    justify-content: space-between
    gap: 0.5rem
    padding: 0.25rem 0

  .context-item-name
    font-size: 0.8125rem
    color: hsl(222 47% 11%)
    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .context-item-count
    font-size: 0.75rem
    color: hsl(215 16% 47%)
    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
</style>
