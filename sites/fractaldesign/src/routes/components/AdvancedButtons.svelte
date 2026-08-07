<script lang="ts">
  let {
    variant = 'wave',
    class: className = '',
    children,
    ...rest
  }: {
    variant?: 'wave' | 'bubble' | 'diagonal' | 'center';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<button class="advanced-btn advanced-btn--{variant} {className}" type="button" {...rest}>
  <span class="advanced-btn__label">
    {@render children?.()}
  </span>
</button>

<style lang="sass">
  .advanced-btn
    position: relative
    overflow: hidden
    display: inline-flex
    align-items: center
    justify-content: center
    padding: 1rem 2rem
    border: 2px solid hsl(222 47% 11%)
    border-radius: 0.5rem
    background: transparent
    color: hsl(222 47% 11%)
    font-weight: 500
    cursor: pointer
    transition: color 200ms cubic-bezier(0.4, 0, 0.2, 1)
    outline: none

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 4px

    &:hover
      color: hsl(0 0% 100%)

    &__label
      position: relative
      z-index: 10

    // Wave fill
    &--wave::after
      content: ""
      position: absolute
      bottom: 0
      left: 0
      width: 100%
      height: 0
      background-color: hsl(222 47% 11%)
      transition: height 400ms cubic-bezier(0.4, 0, 0.2, 1)
      border-radius: 50% 50% 0 0

    &--wave:hover::after
      height: 100%
      border-radius: 0

    // Diagonal
    &--diagonal::after
      content: ""
      position: absolute
      inset: 0
      background-color: hsl(222 47% 11%)
      transform: translateX(-100%) skewX(12deg)
      transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1)

    &--diagonal:hover::after
      transform: translateX(0) skewX(12deg)

    // Center expand
    &--center::after
      content: ""
      position: absolute
      top: 50%
      left: 50%
      width: 0
      height: 0
      background-color: hsl(222 47% 11%)
      border-radius: 50%
      transform: translate(-50%, -50%)
      transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1), height 400ms cubic-bezier(0.4, 0, 0.2, 1)

    &--center:hover::after
      width: 20rem
      height: 20rem

    @media (prefers-color-scheme: dark)
      border-color: hsl(210 40% 98%)
      color: hsl(210 40% 98%)
      &--wave::after,
      &--diagonal::after,
      &--center::after
        background-color: hsl(210 40% 98%)
      &:hover
        color: hsl(222 47% 11%)
</style>
