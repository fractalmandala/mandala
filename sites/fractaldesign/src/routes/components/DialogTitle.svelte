<script lang="ts">
  let {
    class: className = '',
    children,
    ...rest
  }: {
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<h2 class="dialog-title {className}" {...rest}>
  {@render children?.()}
</h2>

<style lang="sass">
  .dialog-title
    margin: 0
    font-size: 1.125rem
    font-weight: 600
    line-height: 1.25
    letter-spacing: -0.01em
    color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
</style>
