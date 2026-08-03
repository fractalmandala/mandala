<script lang="ts">
  let {
    placeholder = 'Type a command…',
    value,
    class: className = '',
    ...rest
  }: {
    placeholder?: string;
    value?: string;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="command-input-wrapper {className}">
  <div class="command-input">
    <svg class="command-input__search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <input {placeholder} {value} {...rest} />
  </div>
</div>

<style lang="sass">
  .command-input-wrapper
    padding: 0.25rem 0.25rem 0

  .command-input
    display: flex
    align-items: center
    height: 2rem
    padding: 0 0.5rem
    border: 1px solid hsl(217 33% 17% / 0.3)
    border-radius: 0.5rem
    background-color: hsl(217 33% 17% / 0.3)
    color: hsl(222 47% 11%)
    font-size: 0.875rem
    outline: none
    box-shadow: none

    &::placeholder
      color: hsl(215 16% 47%)

    &:focus-within
      outline: none

    &:disabled
      cursor: not-allowed
      opacity: 0.5

    > .command-input__search-icon
      width: 1rem
      height: 1rem
      margin-right: 0.5rem
      color: hsl(215 16% 47%)
      flex-shrink: 0

    > input
      flex: 1
      border: none
      outline: none
      background: transparent
      color: inherit
      font: inherit
      &::placeholder
        color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 22% / 0.3)
      border-color: hsl(217 33% 22% / 0.5)
      color: hsl(210 40% 98%)
</style>
