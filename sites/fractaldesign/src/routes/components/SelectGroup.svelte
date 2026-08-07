<script lang="ts">
  let {
    label,
    class: className = '',
    children,
    ...rest
  }: {
    label?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="select-group {className}" {...rest}>
  {#if label}
    <div class="select-label">{label}</div>
  {/if}
  {@render children?.()}
</div>

<style lang="sass">
  .select-group
    display: flex
    flex-direction: column
    gap: 0.125rem

  .select-label
    padding: 0.5rem 0.625rem
    font-size: 0.6875rem
    font-weight: 600
    text-transform: uppercase
    letter-spacing: 0.05em
    color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
</style>
