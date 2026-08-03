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

<div class="artifact {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .artifact
    display: flex
    flex-direction: column
    overflow: hidden
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    box-shadow: 0 1px 2px 0 hsl(0 0% 0% / 0.05)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      color: hsl(210 40% 98%)
</style>
