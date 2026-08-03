<script lang="ts">
  let {
    size = 'default' as const,
    placeholder = false,
    invalid = false,
    disabled = false,
    class: className = '',
    children,
    ...rest
  }: {
    size?: 'default' | 'sm';
    placeholder?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<button
  class="select-trigger {className}"
  type="button"
  data-size={size}
  data-placeholder={placeholder ? '' : undefined}
  aria-invalid={invalid ? 'true' : undefined}
  {disabled}
  {...rest}
>
  <span data-slot="select-value">
    {@render children?.()}
  </span>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
</button>

<style lang="sass">
  .select-trigger
    display: inline-flex
    width: fit-content
    align-items: center
    justify-content: space-between
    gap: 0.375rem
    padding: 0.5rem 0.625rem
    border: 1px solid hsl(217 33% 17%)
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(222 47% 11%)
    font-size: 0.875rem
    white-space: nowrap
    box-shadow: 0 1px 2px 0 hsl(0 0% 0% / 0.05)
    outline: none
    cursor: default
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &[data-placeholder]
      color: hsl(215 16% 47%)

    &:focus-visible
      border-color: hsl(222 47% 11% / 0.5)
      outline: none
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.5)

    &[aria-invalid="true"]
      box-shadow: 0 0 0 3px hsl(0 84% 60% / 0.2)
      border-color: hsl(0 84% 60%)

    &:disabled
      pointer-events: none
      cursor: not-allowed
      opacity: 0.5

    &[data-size="default"]
      height: 2.25rem

    &[data-size="sm"]
      height: 2rem

    > [data-slot="select-value"]
      display: flex
      align-items: center
      gap: 0.375rem
      flex: 1 1 auto
      text-overflow: ellipsis
      overflow: hidden

    > svg
      pointer-events: none
      flex-shrink: 0
      width: 1rem
      height: 1rem
      color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 22% / 0.3)
      border-color: hsl(217 33% 22%)
      color: hsl(210 40% 98%)
      &[data-placeholder]
        color: hsl(215 16% 65%)
      &:hover
        background-color: hsl(217 33% 22% / 0.5)
</style>
