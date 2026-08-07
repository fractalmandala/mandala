<script lang="ts">
  let {
    heading,
    class: className = '',
    children,
    ...rest
  }: {
    heading?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="command-group {className}" {...rest}>
  {#if heading}
    <div class="command-group__heading">{heading}</div>
  {/if}
  {@render children?.()}
</div>

<style lang="sass">
  .command-group
    display: flex
    flex-direction: column
    gap: 0.125rem
    padding: 0.125rem 0
    overflow: hidden
    color: hsl(222 47% 11%)

    &__heading
      padding: 0.375rem 0.5rem
      font-size: 0.6875rem
      font-weight: 600
      letter-spacing: 0.05em
      text-transform: uppercase
      color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
</style>
