<script lang="ts">
  let {
    variant = 'default' as const,
    class: className = '',
    children,
    ...rest
  }: {
    variant?: 'default' | 'destructive';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="alert alert--{variant} {className}" role="alert" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .alert
    display: grid
    grid-template-columns: 1fr
    grid-auto-rows: min-content
    width: 100%
    text-align: left
    font-size: 0.875rem
    line-height: 1.4
    position: relative
    gap: 0.125rem
    padding: 0.75rem 1rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)

    &:has(> svg)
      grid-template-columns: auto 1fr
      column-gap: 0.625rem
      > svg
        grid-row: span 2
        grid-column: 1
        align-self: start
        transform: translateY(0.125rem)
        color: currentColor
        width: 1rem
        height: 1rem

    &:has([data-slot="alert-action"])
      padding-right: 4.5rem

    &--default
      color: hsl(222 47% 11%)

    &--destructive
      color: hsl(0 84% 60%)
      [data-slot="alert-description"]
        color: hsl(0 84% 60% / 0.9)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      color: hsl(210 40% 98%)

      &--destructive
        color: hsl(0 84% 70%)
        [data-slot="alert-description"]
          color: hsl(0 84% 70% / 0.9)
</style>
