<script lang="ts">
  let {
    direction = 'prev' as const,
    disabled = false,
    onclick,
    class: className = '',
    ...rest
  }: {
    direction?: 'prev' | 'next';
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<button
  class="carousel-nav carousel-{direction} {className}"
  type="button"
  aria-label={direction === 'prev' ? 'Previous' : 'Next'}
  {disabled}
  {onclick}
  {...rest}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    {#if direction === 'prev'}
      <path d="m15 18-6-6 6-6"/>
    {:else}
      <path d="m9 18 6-6-6-6"/>
    {/if}
  </svg>
</button>

<style lang="sass">
  .carousel-nav
    display: inline-flex
    align-items: center
    justify-content: center
    width: 2rem
    height: 2rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 9999px
    background-color: hsl(0 0% 100%)
    color: hsl(215 16% 47%)
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover:not(:disabled)
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &:focus-visible
      outline: none
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.4)

    &:disabled
      pointer-events: none
      opacity: 0.4

    > svg
      width: 1rem
      height: 1rem
      flex-shrink: 0

    &.carousel-prev
      position: absolute
      top: 50%
      left: -1rem
      transform: translateY(-50%)

    &.carousel-next
      position: absolute
      top: 50%
      right: -1rem
      transform: translateY(-50%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      color: hsl(215 16% 65%)
      &:hover:not(:disabled)
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
</style>
