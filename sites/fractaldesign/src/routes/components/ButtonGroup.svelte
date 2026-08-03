<script lang="ts">
  let {
    orientation = 'horizontal' as const,
    class: className = '',
    children,
    ...rest
  }: {
    orientation?: 'horizontal' | 'vertical';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="button-group button-group--{orientation} {className}" data-slot="button-group" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .button-group
    display: flex
    width: fit-content
    align-items: stretch
    gap: 0

    > [data-slot]
      position: relative
      &:focus-visible
        position: relative
        z-index: 10

    > input
      flex: 1 1 auto

    &:has([data-slot="button-group"])
      gap: 0.5rem

    &--horizontal
      flex-direction: row
      > [data-slot]
        border-top-right-radius: 0
        border-bottom-right-radius: 0
      > [data-slot]:not(:has(~ [data-slot]))
        border-top-right-radius: 0.375rem
        border-bottom-right-radius: 0.375rem
      > [data-slot] ~ [data-slot]
        border-top-left-radius: 0
        border-bottom-left-radius: 0
        border-left-width: 0

    &--vertical
      flex-direction: column
      > [data-slot]
        border-bottom-right-radius: 0
        border-bottom-left-radius: 0
      > [data-slot]:not(:has(~ [data-slot]))
        border-bottom-right-radius: 0.375rem
        border-bottom-left-radius: 0.375rem
      > [data-slot] ~ [data-slot]
        border-top-left-radius: 0
        border-top-right-radius: 0
        border-top-width: 0
</style>
