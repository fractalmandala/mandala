<script lang="ts">
  let {
    variant,
    disabled = false,
    class: className = '',
    children,
    ...rest
  }: {
    variant?: 'destructive';
    disabled?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div
  class="dropdown-menu-item {variant ? `dropdown-menu-item--${variant}` : ''} {className}"
  data-variant={variant}
  data-disabled={disabled ? 'true' : undefined}
  {...rest}
>
  {@render children?.()}
</div>

<style lang="sass">
  .dropdown-menu-item
    position: relative
    display: flex
    align-items: center
    gap: 0.5rem
    padding: 0.375rem 0.5rem
    border-radius: 0.375rem
    font-size: 0.875rem
    cursor: default
    user-select: none
    -webkit-user-select: none
    color: inherit
    outline: none
    transition: background-color 100ms ease-out, color 100ms ease-out

    &[data-highlighted],
    &:focus-visible
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &[data-disabled]
      pointer-events: none
      opacity: 0.5

    > svg
      width: 1rem
      height: 1rem
      color: hsl(215 16% 47%)
      flex-shrink: 0
      pointer-events: none

    &--destructive
      color: hsl(0 84% 60%)
      &[data-highlighted],
      &:focus-visible
        background-color: hsl(0 84% 60% / 0.1)
        color: hsl(0 84% 60%)
      > svg
        color: hsl(0 84% 60%)

    @media (prefers-color-scheme: dark)
      &[data-highlighted],
      &:focus-visible
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
      &--destructive
        color: hsl(0 84% 70%)
        &[data-highlighted]
          background-color: hsl(0 84% 60% / 0.2)
</style>
