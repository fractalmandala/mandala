<script lang="ts">
  let {
    collapsed = false,
    side = 'left' as const,
    class: className = '',
    children,
    ...rest
  }: {
    collapsed?: boolean;
    side?: 'left' | 'right';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<aside
  class="sidebar sidebar--{side} {collapsed ? 'sidebar--collapsed' : ''} {className}"
  data-collapsed={collapsed ? 'true' : undefined}
  {...rest}
>
  {@render children?.()}
</aside>

<style lang="sass">
  .sidebar
    display: flex
    flex-direction: column
    height: 100%
    background-color: hsl(0 0% 100%)
    border-right: 1px solid hsl(214 32% 91%)
    width: 260px
    transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1)

    &--right
      border-right: none
      border-left: 1px solid hsl(214 32% 91%)

    &--collapsed
      width: 48px
      overflow: hidden

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-right-color: hsl(217 33% 17%)
      &--right
        border-left-color: hsl(217 33% 17%)
</style>
