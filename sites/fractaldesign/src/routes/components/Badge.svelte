<script lang="ts">
  let {
    variant = 'default' as const,
    href,
    class: className = '',
    children,
    ...rest
  }: {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
    href?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

{#if href}
  <a class="badge badge--{variant} {className}" {href} {...rest}>
    {@render children?.()}
  </a>
{:else}
  <span class="badge badge--{variant} {className}" {...rest}>
    {@render children?.()}
  </span>
{/if}

<style lang="sass">
  .badge
    display: inline-flex
    flex-shrink: 0
    align-items: center
    justify-content: center
    gap: 0.25rem
    height: 1.25rem
    width: fit-content
    padding: 0.125rem 0.5rem
    border: 1px solid transparent
    border-radius: 9999px
    font-size: 0.75rem
    font-weight: 500
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
    user-select: none
    -webkit-user-select: none
    cursor: default
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)
    text-decoration: none

    &:focus-visible
      outline: none
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.5)

    &[aria-invalid="true"]
      border-color: hsl(0 84% 60%)
      box-shadow: 0 0 0 3px hsl(0 84% 60% / 0.2)

    > svg
      pointer-events: none
      flex-shrink: 0
      width: 0.75rem
      height: 0.75rem

    &:has([data-icon="inline-start"])
      padding-left: 0.375rem
    &:has([data-icon="inline-end"])
      padding-right: 0.375rem

    &--default
      background-color: hsl(222 47% 11%)
      color: hsl(210 40% 98%)
      &:where(a):hover
        background-color: hsl(222 47% 15%)

    &--secondary
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)
      &:where(a):hover
        background-color: hsl(210 40% 92%)

    &--destructive
      background-color: hsl(0 84% 60% / 0.1)
      color: hsl(0 84% 60%)
      &:where(a):hover
        background-color: hsl(0 84% 60% / 0.2)
      &:focus-visible
        box-shadow: 0 0 0 3px hsl(0 84% 60% / 0.2)
      @media (prefers-color-scheme: dark)
        background-color: hsl(0 84% 60% / 0.2)

    &--outline
      border-color: hsl(214 32% 91%)
      color: hsl(222 47% 11%)
      background-color: transparent
      &:where(a):hover
        background-color: hsl(210 40% 96%)
        color: hsl(215 16% 47%)
      @media (prefers-color-scheme: dark)
        border-color: hsl(217 33% 17%)

    &--ghost
      background-color: transparent
      color: hsl(215 16% 47%)
      &:hover
        background-color: hsl(210 40% 96%)
        color: hsl(215 16% 47%)
      @media (prefers-color-scheme: dark)
        &:hover
          background-color: hsl(217 33% 17% / 0.5)

    &--link
      background-color: transparent
      color: hsl(222 47% 11%)
      text-underline-offset: 4px
      &:hover
        text-decoration: underline

  a.badge
    cursor: pointer
</style>
