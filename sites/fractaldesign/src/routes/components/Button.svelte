<script lang="ts">
  let {
    variant = 'default',
    size = 'default',
    href,
    disabled = false,
    class: className = '',
    children,
    ...rest
  }: {
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
    size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
    href?: string;
    disabled?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

{#if href}
  <a
    class="button button--{variant} button--size-{size} {className}"
    {href}
    aria-disabled={disabled ? 'true' : undefined}
    tabindex={disabled ? -1 : undefined}
    {...rest}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    class="button button--{variant} button--size-{size} {className}"
    {disabled}
    {...rest}
  >
    {@render children?.()}
  </button>
{/if}

<style lang="sass">
  .button
    display: inline-flex
    flex-shrink: 0
    align-items: center
    justify-content: center
    border: 1px solid transparent
    border-radius: 0.375rem
    background-clip: padding-box
    font-weight: 500
    white-space: nowrap
    cursor: pointer
    user-select: none
    -webkit-user-select: none
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)
    outline: none
    text-decoration: none
    height: 2.25rem
    gap: 0.375rem
    padding: 0 0.625rem
    font-size: 0.875rem
    background-color: hsl(222 47% 11%)
    color: hsl(210 40% 98%)

    &:focus-visible
      outline: none
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.5)

    &:disabled
      pointer-events: none
      opacity: 0.5

    &:hover:not(:disabled)
      background-color: hsl(222 47% 15%)

    &:active:not([aria-haspopup])
      transform: translateY(1px)

    &[aria-invalid="true"]
      border-color: hsl(0 84% 60%)
      box-shadow: 0 0 0 3px hsl(0 84% 60% / 0.2)

    > svg
      pointer-events: none
      flex-shrink: 0
      width: 1rem
      height: 1rem

    // Variants
    &--default
      background-color: hsl(222 47% 11%)
      color: hsl(210 40% 98%)
      &:hover:not(:disabled)
        background-color: hsl(222 47% 15%)

    &--outline
      border-color: hsl(214 32% 91%)
      background-color: hsl(0 0% 100%)
      color: hsl(222 47% 11%)
      box-shadow: 0 1px 2px 0 hsl(0 0% 0% / 0.05)
      &:hover:not(:disabled)
        background-color: hsl(210 40% 96%)
        color: hsl(222 47% 11%)
      &[aria-expanded="true"]
        background-color: hsl(210 40% 96%)
        color: hsl(222 47% 11%)
      @media (prefers-color-scheme: dark)
        background-color: hsl(217 33% 17% / 0.3)
        border-color: hsl(217 33% 17%)
        &:hover:not(:disabled)
          background-color: hsl(217 33% 17% / 0.5)

    &--secondary
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)
      &:hover:not(:disabled)
        background-color: hsl(210 40% 92%)
      &[aria-expanded="true"]
        background-color: hsl(210 40% 96%)
        color: hsl(222 47% 11%)

    &--ghost
      background-color: transparent
      color: hsl(222 47% 11%)
      &:hover:not(:disabled)
        background-color: hsl(210 40% 96%)
        color: hsl(222 47% 11%)
      &[aria-expanded="true"]
        background-color: hsl(210 40% 96%)
        color: hsl(222 47% 11%)
      @media (prefers-color-scheme: dark)
        &:hover:not(:disabled)
          background-color: hsl(217 33% 17% / 0.5)

    &--destructive
      background-color: hsl(0 84% 60% / 0.1)
      color: hsl(0 84% 60%)
      &:hover:not(:disabled)
        background-color: hsl(0 84% 60% / 0.2)
      &:focus-visible
        box-shadow: 0 0 0 3px hsl(0 84% 60% / 0.2)
      @media (prefers-color-scheme: dark)
        background-color: hsl(0 84% 60% / 0.2)
        &:hover:not(:disabled)
          background-color: hsl(0 84% 60% / 0.3)
        &:focus-visible
          box-shadow: 0 0 0 3px hsl(0 84% 60% / 0.4)

    &--link
      background-color: transparent
      color: hsl(222 47% 11%)
      text-underline-offset: 4px
      &:hover:not(:disabled)
        text-decoration: underline

    // Sizes
    &--size-default
      height: 2.25rem
      gap: 0.375rem
      padding: 0 0.625rem
      font-size: 0.875rem
      &:has([data-icon="inline-start"])
        padding-left: 0.5rem
      &:has([data-icon="inline-end"])
        padding-right: 0.5rem

    &--size-xs
      height: 1.5rem
      gap: 0.25rem
      padding: 0 0.5rem
      font-size: 0.75rem
      border-radius: min(0.375rem, 8px)
      &:has([data-icon="inline-start"])
        padding-left: 0.375rem
      &:has([data-icon="inline-end"])
        padding-right: 0.375rem
      > svg
        width: 0.75rem
        height: 0.75rem

    &--size-sm
      height: 2rem
      gap: 0.25rem
      padding: 0 0.625rem
      font-size: 0.875rem
      border-radius: min(0.375rem, 10px)

    &--size-lg
      height: 2.5rem
      gap: 0.375rem
      padding: 0 0.625rem
      font-size: 0.875rem

    &--size-icon
      width: 2.25rem
      padding: 0

    &--size-icon-xs
      width: 1.5rem
      height: 1.5rem
      padding: 0
      border-radius: min(0.375rem, 8px)
      > svg
        width: 0.75rem
        height: 0.75rem

    &--size-icon-sm
      width: 2rem
      height: 2rem
      padding: 0
      border-radius: min(0.375rem, 10px)

    &--size-icon-lg
      width: 2.5rem
      height: 2.5rem
      padding: 0

  a.button
    text-decoration: none
    &[aria-disabled="true"]
      pointer-events: none
      opacity: 0.5
</style>
