<script lang="ts">
  let {
    active = false,
    disabled = false,
    class: className = '',
    children,
    ...rest
  }: {
    active?: boolean;
    disabled?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<button
  class="tabs-trigger {className}"
  type="button"
  role="tab"
  aria-selected={active}
  data-state={active ? 'active' : 'inactive'}
  data-active={active ? 'true' : undefined}
  {disabled}
  {...rest}
>
  {@render children?.()}
</button>

<style lang="sass">
  .tabs-trigger
    position: relative
    display: inline-flex
    flex: 1 1 0%
    align-items: center
    justify-content: center
    gap: 0.375rem
    height: calc(100% - 1px)
    padding: 0.25rem 0.5rem
    border: 1px solid transparent
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(222 47% 11% / 0.6)
    font-size: 0.875rem
    font-weight: 500
    white-space: nowrap
    cursor: pointer
    outline: none
    user-select: none
    -webkit-user-select: none
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:focus-visible
      outline: none
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.5)

    &[data-state="active"],
    &[data-active="true"]
      background-color: hsl(0 0% 100%)
      color: hsl(222 47% 11%)
      box-shadow: 0 1px 2px 0 hsl(0 0% 0% / 0.05)

    &[disabled]
      pointer-events: none
      cursor: not-allowed
      opacity: 0.5

    > svg
      width: 1rem
      height: 1rem
      flex-shrink: 0
      pointer-events: none

    .tabs-list[data-variant="line"] &::after
      content: ""
      position: absolute
      background-color: hsl(222 47% 11%)
      opacity: 0
      transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)

    .tabs-list[data-variant="line"][data-orientation="horizontal"] &::after
      right: 0
      bottom: -0.3125rem
      left: 0
      height: 0.125rem

    .tabs-list[data-variant="line"][data-orientation="vertical"] &::after
      top: 0
      bottom: 0
      right: -0.25rem
      width: 0.125rem

    .tabs-list[data-variant="line"] &[data-state="active"]::after
      opacity: 1

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
      &[data-state="active"]
        background-color: hsl(217 33% 22% / 0.3)
        color: hsl(210 40% 98%)
        border-color: hsl(217 33% 22%)

      .tabs-list[data-variant="line"] &::after
        background-color: hsl(210 40% 98%)
</style>
