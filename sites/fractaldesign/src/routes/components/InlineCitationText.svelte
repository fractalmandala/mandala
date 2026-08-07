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

<span class="inline-citation-text {className}" {...rest}>
  {@render children?.()}
</span>

<style lang="sass">
  .inline-citation-text
    color: inherit
    border-bottom: 1px solid hsl(214 32% 91%)
    cursor: pointer
    transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      border-bottom-color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      border-bottom-color: hsl(217 33% 17%)
</style>
