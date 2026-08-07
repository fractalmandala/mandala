<script lang="ts">
  let {
    variant = 'ghost' as const,
    label,
    disabled = false,
    class: className = '',
    children,
    ...rest
  }: {
    variant?: 'ghost' | 'outline' | 'secondary' | 'destructive';
    label?: string;
    disabled?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<button class="action action--{variant} {className}" type="button" aria-label={label} {disabled} {...rest}>
  {@render children?.()}
  {#if label}
    <span class="action__label">{label}</span>
  {/if}
</button>

<style lang="sass">
  .action
    position: relative
    display: inline-flex
    align-items: center
    justify-content: center
    width: 2.25rem
    height: 2.25rem
    padding: 0.375rem
    border: 1px solid transparent
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(215 16% 47%)
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)
    user-select: none
    -webkit-user-select: none

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px

    &:disabled
      pointer-events: none
      opacity: 0.5

    &:active
      transform: translateY(1px)

    &:hover
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

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

    &--outline
      border-color: hsl(214 32% 91%)
      background-color: hsl(0 0% 100%)
      &:hover
        background-color: hsl(210 40% 96%)

    &--secondary
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)
      &:hover
        background-color: hsl(214 32% 91%)

    &--destructive
      background-color: hsl(0 84% 60% / 0.1)
      color: hsl(0 84% 60%)
      &:hover
        background-color: hsl(0 84% 60% / 0.2)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
      &:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
</style>
