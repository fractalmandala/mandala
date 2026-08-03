<script lang="ts">
  let {
    checked = false,
    disabled = false,
    onclick,
    class: className = '',
    ...rest
  }: {
    checked?: boolean;
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    class?: string;
    [key: string]: unknown;
  } = $props();

  function handleClick(e: MouseEvent) {
    if (disabled) return;
    onclick?.(e);
  }
</script>

<button
  class="switch {className}"
  data-state={checked ? 'checked' : 'unchecked'}
  data-disabled={disabled ? 'true' : undefined}
  type="button"
  role="switch"
  aria-checked={checked}
  {onclick}
  {...rest}
>
  <span class="switch-thumb"></span>
</button>

<style lang="sass">
  .switch
    position: relative
    display: inline-flex
    flex-shrink: 0
    align-items: center
    width: 2.25rem
    height: 1.25rem
    border: 1px solid transparent
    border-radius: 9999px
    background-color: hsl(210 40% 96%)
    cursor: pointer
    outline: none
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:focus-visible
      outline: none
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.5)

    &[data-state="checked"]
      background-color: hsl(222 47% 11%)

    &[data-disabled]
      pointer-events: none
      cursor: not-allowed
      opacity: 0.5

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 22%)
      &[data-state="checked"]
        background-color: hsl(210 40% 98%)

  .switch-thumb
    display: block
    width: 1rem
    height: 1rem
    border-radius: 9999px
    background-color: hsl(0 0% 100%)
    box-shadow: 0 1px 3px 0 hsl(0 0% 0% / 0.2)
    transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1)
    transform: translateX(0.125rem)

    .switch[data-state="checked"] &
      transform: translateX(calc(2.25rem - 1rem - 0.25rem))

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
</style>
