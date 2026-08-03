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

<p class="artifact-description {className}" {...rest}>
  {@render children?.()}
</p>

<style lang="sass">
  .artifact-description
    margin: 0
    font-size: 0.875rem
    line-height: 1.25
    color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
</style>
