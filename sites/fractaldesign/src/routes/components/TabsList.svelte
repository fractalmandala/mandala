<script lang="ts">
  let {
    variant = 'default' as const,
    orientation = 'horizontal' as const,
    class: className = '',
    children,
    ...rest
  }: {
    variant?: 'default' | 'line';
    orientation?: 'horizontal' | 'vertical';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="tabs-list {className}" data-variant={variant} data-orientation={orientation} role="tablist" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .tabs-list
    display: inline-flex
    align-items: center
    justify-content: center
    padding: 0.1875rem
    border-radius: 0.5rem
    background-color: hsl(210 40% 96%)
    color: hsl(215 16% 47%)

    &[data-orientation="horizontal"]
      height: 2.25rem

    &[data-orientation="vertical"]
      flex-direction: column
      height: fit-content

    &[data-variant="line"]
      background-color: transparent
      border-radius: 0
      padding: 0
      gap: 0.25rem
      &[data-orientation="horizontal"]
        border-bottom: 1px solid hsl(214 32% 91%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)
      color: hsl(215 16% 65%)
      &[data-variant="line"]
        background-color: transparent
        &[data-orientation="horizontal"]
          border-bottom-color: hsl(217 33% 17%)
</style>
