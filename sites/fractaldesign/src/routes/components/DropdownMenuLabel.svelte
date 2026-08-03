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

<div class="dropdown-menu-label {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .dropdown-menu-label
    padding: 0.375rem 0.5rem
    font-size: 0.6875rem
    font-weight: 600
    letter-spacing: 0.05em
    text-transform: uppercase
    color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
</style>
