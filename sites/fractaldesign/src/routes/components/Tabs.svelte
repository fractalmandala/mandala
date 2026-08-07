<script lang="ts">
  let {
    orientation = 'horizontal' as const,
    class: className = '',
    children,
    ...rest
  }: {
    orientation?: 'horizontal' | 'vertical';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="tabs {className}" data-orientation={orientation} {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .tabs
    display: flex
    flex-direction: column
    gap: 0.5rem
    width: 100%
    color: hsl(222 47% 11% / 0.6)
    outline: none

    &[data-orientation="horizontal"]
      flex-direction: column

    &[data-orientation="vertical"]
      flex-direction: row
      gap: 1rem

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98% / 0.6)
</style>
