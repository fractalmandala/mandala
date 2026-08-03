<script lang="ts">
  let {
    class: className = '',
    value,
    placeholder,
    ...rest
  }: {
    class?: string;
    value?: string;
    placeholder?: string;
    [key: string]: unknown;
  } = $props();
</script>

<textarea class="textarea {className}" {placeholder} {value} {...rest}></textarea>

<style lang="sass">
  .textarea
    display: block
    width: 100%
    min-width: 0
    min-height: 2.25rem
    padding: 0.5rem 0.625rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(222 47% 11%)
    font-size: 0.875rem
    line-height: 1.5
    box-shadow: 0 1px 2px 0 hsl(0 0% 0% / 0.05)
    outline: none
    resize: vertical
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &::placeholder
      color: hsl(215 16% 47%)

    &:focus-visible
      border-color: hsl(222 47% 11% / 0.5)
      outline: none
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.5)

    &[aria-invalid="true"]
      border-color: hsl(0 84% 60%)
      box-shadow: 0 0 0 3px hsl(0 84% 60% / 0.2)

    &:disabled
      pointer-events: none
      cursor: not-allowed
      opacity: 0.5

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17% / 0.3)
      border-color: hsl(217 33% 17%)
      color: hsl(210 40% 98%)
</style>
