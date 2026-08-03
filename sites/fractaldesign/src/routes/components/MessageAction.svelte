<script lang="ts">
  let {
    label,
    disabled = false,
    class: className = '',
    children,
    ...rest
  }: {
    label?: string;
    disabled?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<button class="message-action {className}" type="button" aria-label={label} {disabled} {...rest}>
  {@render children?.()}
  {#if label}
    <span class="message-action__label">{label}</span>
  {/if}
</button>

<style lang="sass">
  .message-action
    display: inline-flex
    align-items: center
    justify-content: center
    width: 2rem
    height: 2rem
    border: 1px solid transparent
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(215 16% 47%)
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px

    > svg
      width: 1rem
      height: 1rem
      flex-shrink: 0

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

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
      &:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
</style>
