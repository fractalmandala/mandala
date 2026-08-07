<script lang="ts">
  let {
    active = false,
    label,
    onclick,
    class: className = '',
    children,
    ...rest
  }: {
    active?: boolean;
    label?: string;
    onclick?: (e: MouseEvent) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<span class="checkpoint {className}" {...rest}>
  <button
    class="checkpoint-trigger {active ? 'checkpoint-trigger--active' : ''}"
    type="button"
    aria-label={label}
    {onclick}
  >
    <span class="checkpoint-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    </span>
    {#if label}
      <span class="checkpoint-trigger__label">{label}</span>
    {/if}
  </button>
  {@render children?.()}
</span>

<style lang="sass">
  .checkpoint
    display: inline-flex
    align-items: center
    gap: 0.125rem
    overflow: hidden
    color: hsl(215 16% 47%)
    vertical-align: middle

    & + .checkpoint::before
      content: ""
      display: inline-block
      width: 1px
      height: 1rem
      background-color: hsl(214 32% 91%)
      margin: 0 0.25rem

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
      & + .checkpoint::before
        background-color: hsl(217 33% 17%)

  .checkpoint-icon
    display: inline-flex
    align-items: center
    justify-content: center
    width: 1rem
    height: 1rem
    flex-shrink: 0
    color: inherit

    > svg
      width: 100%
      height: 100%

  .checkpoint-trigger
    display: inline-flex
    align-items: center
    justify-content: center
    width: 2rem
    height: 2rem
    padding: 0
    border: 1px solid transparent
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(215 16% 47%)
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px

    &__label
      position: absolute
      width: 1px
      height: 1px
      padding: 0
      margin: -1px
      overflow: hidden
      clip: rect(0, 0, 0, 0)
      white-space: nowrap
      border: 0

    &--active
      color: hsl(222 47% 11%)
      background-color: hsl(210 40% 96%)

    > svg
      width: 1rem
      height: 1rem
      pointer-events: none
      flex-shrink: 0

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
      &:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
      &--active
        color: hsl(210 40% 98%)
        background-color: hsl(217 33% 17%)
</style>
