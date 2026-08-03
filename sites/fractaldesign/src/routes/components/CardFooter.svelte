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

<div class="card-footer {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .card-footer
    display: flex
    align-items: center
    gap: 0.5rem
    padding: 0 1.5rem 1.5rem
    border-top: 1px solid hsl(222 47% 11% / 0.1)
    margin-top: auto

    .card[data-size="sm"] &
      padding: 0 1rem 1rem

    @media (prefers-color-scheme: dark)
      border-top-color: hsl(210 40% 98% / 0.1)
</style>
