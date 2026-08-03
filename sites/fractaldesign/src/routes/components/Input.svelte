<script lang="ts">
  let {
    type = 'text',
    class: className = '',
    placeholder,
    value,
    ...rest
  }: {
    type?: string;
    class?: string;
    placeholder?: string;
    value?: string;
    [key: string]: unknown;
  } = $props();
</script>

{#if type === 'file'}
  <input class="input input--file {className}" {type} {...rest} />
{:else}
  <input class="input {className}" {type} {placeholder} {value} {...rest} />
{/if}

<style lang="sass">
  .input
    display: block
    width: 100%
    min-width: 0
    height: 2.25rem
    padding: 0.25rem 0.625rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(222 47% 11%)
    font-size: 1rem
    line-height: 1.25
    box-shadow: 0 1px 2px 0 hsl(0 0% 0% / 0.05)
    outline: none
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

    @media (min-width: 768px)
      font-size: 0.875rem

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17% / 0.3)
      border-color: hsl(217 33% 17%)

  .input--file
    font-size: 1rem

    &::file-selector-button
      display: inline-flex
      align-items: center
      justify-content: center
      height: 1.75rem
      padding: 0 0.5rem
      margin: 0 -0.625rem 0 -0.625rem
      border: 0
      border-radius: 0
      background-color: transparent
      color: hsl(222 47% 11%)
      font-size: 0.875rem
      font-weight: 500
      cursor: pointer

    @media (min-width: 768px)
      font-size: 0.875rem

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17% / 0.3)
      border-color: hsl(217 33% 17%)

  @media (prefers-color-scheme: dark)
    .input[aria-invalid="true"]
      box-shadow: 0 0 0 3px hsl(0 84% 60% / 0.4)
      border-color: hsl(0 84% 60% / 0.5)
</style>
