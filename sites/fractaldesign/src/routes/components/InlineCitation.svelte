<script lang="ts">
  let {
    href = '#',
    host,
    title,
    quote,
    class: className = '',
    children,
    ...rest
  }: {
    href?: string;
    host?: string;
    title?: string;
    quote?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<span class="inline-citation {className}" {...rest}>
  <a class="inline-citation-badge" {href} target="_blank" rel="noopener noreferrer">
    {#if children}
      {@render children?.()}
    {:else}
      {host || 'source'}
    {/if}
  </a>
</span>

<style lang="sass">
  .inline-citation
    display: inline-flex
    align-items: center
    gap: 0.25rem
    vertical-align: baseline

  .inline-citation-badge
    display: inline-flex
    align-items: center
    height: 1.25rem
    padding: 0 0.375rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 9999px
    background-color: hsl(0 0% 100%)
    color: hsl(215 16% 47%)
    font-size: 0.75rem
    font-weight: 500
    text-decoration: none
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px

    @media (prefers-color-scheme: dark)
      border-color: hsl(217 33% 17%)
      background-color: hsl(222 47% 6%)
      color: hsl(215 16% 65%)
      &:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
</style>
