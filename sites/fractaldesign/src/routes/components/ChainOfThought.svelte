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

<div class="chain-of-thought {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .chain-of-thought
    display: flex
    flex-direction: column
    gap: 0.375rem
    padding: 0.75rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      color: hsl(210 40% 98%)
</style>
