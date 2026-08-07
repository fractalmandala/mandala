<script lang="ts">
  let {
    name = '',
    selected = false,
    onclick,
    class: className = '',
    ...rest
  }: {
    name?: string;
    selected?: boolean;
    onclick?: (e: MouseEvent) => void;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<button class="model-selector-item {selected ? 'model-selector-item--selected' : ''} {className}" type="button" onclick={onclick} role="option" aria-selected={selected} {...rest}>
  <span class="model-radio"></span>
  <span class="model-name">{name}</span>
  {#if selected}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  {/if}
</button>

<style lang="sass">
  .model-selector-item
    display: flex
    align-items: center
    gap: 0.5rem
    width: 100%
    padding: 0.5rem
    border: 0
    border-radius: 0.375rem
    background: transparent
    color: hsl(222 47% 11%)
    font-size: 0.875rem
    cursor: pointer
    text-align: left
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)

    &--selected
      background-color: hsl(210 40% 96%)
      font-weight: 600

    > svg
      width: 1rem
      height: 1rem
      margin-left: auto
      flex-shrink: 0
      color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
      &:hover, &--selected
        background-color: hsl(217 33% 17%)

  .model-radio
    display: inline-flex
    align-items: center
    justify-content: center
    width: 1rem
    height: 1rem
    border: 2px solid hsl(214 32% 91%)
    border-radius: 9999px
    flex-shrink: 0

    .model-selector-item--selected &
      border-color: hsl(222 47% 11%)
      border-width: 5px

    @media (prefers-color-scheme: dark)
      border-color: hsl(217 33% 17%)
      .model-selector-item--selected &
        border-color: hsl(210 40% 98%)
</style>
