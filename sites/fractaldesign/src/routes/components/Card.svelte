<script lang="ts">
  let {
    size = 'default' as const,
    class: className = '',
    children,
    ...rest
  }: {
    size?: 'default' | 'sm';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="card {className}" data-size={size} {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .card
    position: relative
    display: flex
    flex-direction: column
    gap: 1.5rem
    padding: 0 1.5rem 1.5rem
    border-radius: 0.75rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    font-size: 0.875rem
    line-height: 1.5
    box-shadow: 0 1px 2px 0 hsl(0 0% 0% / 0.05)
    outline: 1px solid hsl(222 47% 11% / 0.1)
    outline-offset: -1px
    overflow: hidden

    &[data-size="sm"]
      gap: 1rem
      padding: 0 1rem 1rem

    &:has(> img:first-child)
      padding-top: 0

    &:has(> img:first-child) > img:first-child
      border-top-left-radius: 0.75rem
      border-top-right-radius: 0.75rem

    &:has(> img:last-child) > img:last-child
      border-bottom-left-radius: 0.75rem
      border-bottom-right-radius: 0.75rem

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      color: hsl(210 40% 98%)
      outline-color: hsl(210 40% 98% / 0.1)
</style>
