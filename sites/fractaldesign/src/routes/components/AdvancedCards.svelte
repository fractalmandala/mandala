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

<div class="advanced-cards {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .advanced-cards
    display: grid
    gap: 1rem


    > * // each card
      transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)
      &:hover
        transform: translateY(-4px) scale(1.01)
        box-shadow: 0 12px 24px -8px hsl(0 0% 0% / 0.15)
</style>
