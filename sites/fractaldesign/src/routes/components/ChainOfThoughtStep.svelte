<script lang="ts">
  let {
    status = 'pending' as const,
    stagger = 0,
    class: className = '',
    children,
    ...rest
  }: {
    status?: 'complete' | 'active' | 'pending';
    stagger?: number;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="chain-of-thought-step chain-of-thought-step--{status} {className}" data-stagger={stagger} {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .chain-of-thought-step
    position: relative
    display: flex
    align-items: flex-start
    gap: 0.5rem
    padding-left: 1rem
    font-size: 0.875rem
    color: hsl(215 16% 47%)
    animation: cot-step-in 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards
    animation-delay: calc(attr(data-stagger number, 0) * 60ms)
    opacity: 0

    &--complete
      color: hsl(215 16% 47%)

    &--active
      color: hsl(222 47% 11%)

    &--pending
      color: hsl(215 16% 47% / 0.5)

    > svg
      width: 1rem
      height: 1rem
      flex-shrink: 0
      margin-top: 0.125rem

    @media (prefers-color-scheme: dark)
      &--active
        color: hsl(210 40% 98%)
      &--pending
        color: hsl(215 16% 65% / 0.5)

  @keyframes cot-step-in
    from
      opacity: 0
      transform: translateX(-6px)
    to
      opacity: 1
      transform: translateX(0)
</style>
