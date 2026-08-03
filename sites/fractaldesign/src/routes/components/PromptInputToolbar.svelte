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

<div class="prompt-input-toolbar {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .prompt-input-toolbar
    display: flex
    align-items: center
    justify-content: space-between
    gap: 0.25rem
    padding: 0.25rem 0.5rem
    border-top: 1px solid hsl(214 32% 91%)

    @media (prefers-color-scheme: dark)
      border-top-color: hsl(217 33% 17%)
</style>
