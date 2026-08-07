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

<blockquote class="inline-citation-quote {className}" {...rest}>
  {@render children?.()}
</blockquote>

<style lang="sass">
  .inline-citation-quote
    margin: 0
    font-size: 0.875rem
    line-height: 1.5
    color: hsl(222 47% 11%)
    border-left: 2px solid hsl(214 32% 91%)
    padding-left: 0.75rem

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
      border-left-color: hsl(217 33% 17%)
</style>
