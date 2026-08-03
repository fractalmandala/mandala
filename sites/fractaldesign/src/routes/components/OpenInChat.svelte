<script lang="ts">
  let {
    href = '#',
    label = 'Open in Chat',
    class: className = '',
    ...rest
  }: {
    href?: string;
    label?: string;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<a class="open-in-chat {className}" {href} target="_blank" rel="noreferrer" {...rest}>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  {label}
</a>

<style lang="sass">
  .open-in-chat
    display: inline-flex
    align-items: center
    gap: 0.375rem
    padding: 0.375rem 0.75rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    font-size: 0.8125rem
    font-weight: 500
    text-decoration: none
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)
      border-color: hsl(222 47% 11% / 0.2)

    > svg
      width: 1rem
      height: 1rem
      flex-shrink: 0

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      color: hsl(210 40% 98%)
      &:hover
        background-color: hsl(217 33% 17%)
</style>
